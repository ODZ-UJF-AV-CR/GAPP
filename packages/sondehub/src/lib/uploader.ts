import { gzip } from 'node:zlib';
import axios from 'axios';

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

/** @description Free-text on the SondeHub side, shown in the tracker sidebar. Known values are listed for convenience. */
export type Modulation = 'APRS' | 'Horus Binary' | 'RTTY' | 'LoRa' | 'WSPR' | 'GFSK' | (string & {});

interface BasePacket {
    software_name: string;
    software_version: string;
    uploader_callsign: string;
    uploader_position?: [number, number, number];
    uploader_antenna?: string;
}

export interface TelemetryPacket extends Partial<BasePacket> {
    dev?: string;
    time_received: string;
    payload_callsign: string;
    datetime: string;
    lat: number;
    lon: number;
    alt: number;
    frequency?: number;
    temp?: number;
    humidity?: number;
    vel_h?: number;
    vel_v?: number;
    pressure?: number;
    heading?: number;
    batt?: number;
    sats?: number;
    snr?: number;
    rssi?: number;
    frame?: number;
    telemetry_hidden?: boolean;
    historical?: boolean;
    upload_time?: string;
    modulation?: Modulation;
    baud_rate?: number;
}

type StationBasePayload = Partial<Omit<BasePacket, 'uploader_callsign' | 'uploader_position'>> &
    Required<Pick<BasePacket, 'uploader_callsign' | 'uploader_position'>>;

export interface StationPositionPacket extends StationBasePayload {
    uploader_radio?: string;
    uploader_contact_email?: string;
    mobile?: boolean;
}

export type LogLevel = 'debug' | 'info' | 'error' | 'none';

export interface Logger {
    debug: (message: string) => void;
    info: (message: string) => void;
    error: (message: string) => void;
}

interface UploaderConfig extends BasePacket {
    /** @description how often packets will be sent to sondehub (in ms) */
    uploadRate: number;
    uploadTimeout: number;
    /** @description attempts per batch, only server errors are retried */
    uploadRetries: number;
    /** @description delay between retry attempts (in ms) */
    uploadRetryDelay: number;
    dev: boolean;
    logLevel?: LogLevel;
    logger?: Partial<Logger>;
}

type MinimalUploaderConfig = Partial<Omit<UploaderConfig, 'uploader_callsign'>> & Pick<UploaderConfig, 'uploader_callsign'>;

/**
 * A class for uploading telemetry and station position data to SondeHub.
 * This class handles queuing, compression, batching and periodic uploading of telemetry packets
 * and station position information to the SondeHub Amateur API.
 *
 * @example
 * const uploader = new Uploader({
 *   uploader_callsign: 'MYCALL',
 *   software_name: 'my-software',
 *   software_version: '1.0.0'
 * });
 */
export class Uploader {
    private timeoutId?: NodeJS.Timeout;
    private stopped = false;
    private uploaderConfig: UploaderConfig = {
        uploader_callsign: '',
        uploadRate: 5_000,
        uploadTimeout: 20_000,
        uploadRetries: 5,
        uploadRetryDelay: 1_000,
        dev: false,
        software_name: 'node-sondehub',
        software_version: '0.0.1',
        logLevel: 'info',
    };

    private telemetryQueue: TelemetryPacket[] = [];

    public static readonly SONDEHUB_AMATEUR_URL = 'https://api.v2.sondehub.org/amateur/telemetry';
    public static readonly SONDEHUB_AMATEUR_STATION_POSITION_URL = 'https://api.v2.sondehub.org/amateur/listeners';

    constructor(options: MinimalUploaderConfig) {
        this.uploaderConfig = {
            ...this.uploaderConfig,
            ...options,
        };

        this.scheduleNextUpload();
    }

    /**
     * Adds a telemetry packet to the upload queue.
     * The packet will be enhanced with default values and uploaded in the next upload cycle.
     *
     * @param {TelemetryPacket} packet - The telemetry packet to be queued for upload
     * @example
     * uploader.addTelemetry({
     *   payload_callsign: 'SONDE-1',
     *   datetime: '2023-01-01T12:00:00Z',
     *   lat: 51.5074,
     *   lon: -0.1278,
     *   alt: 1000
     * });
     */
    public addTelemetry(packet: TelemetryPacket): void {
        const enhancedPacket = this.enhanceTelemetryPacket(packet);

        this.telemetryQueue.push(enhancedPacket);
        this.logDebug('Telemetry packet added to queue.');
    }

    /**
     * Cleanly shuts down the uploader by clearing the upload timer and
     * uploading any remaining packets in the queue.
     * Should be called before the application exits.
     *
     * @returns {Promise<void>} A promise that resolves when all pending uploads are complete
     * @example
     * await uploader.deinit();
     */
    public async deinit(): Promise<void> {
        this.stop();

        if (this.telemetryQueue.length) {
            const remaining = this.telemetryQueue;
            this.telemetryQueue = [];
            await this.uploadTelemetryPackets(remaining);
        }
    }

    /**
     * Stops the upload cycle without flushing, queued packets are kept in memory.
     * Use `deinit` for a clean shutdown that still delivers them.
     */
    public stop(): void {
        this.stopped = true;
        clearTimeout(this.timeoutId);
    }

    /**
     * Uploads a station position update to SondeHub.
     * This method can be used to update the receiver's location and configuration.
     * Car will be shown on map when `mobile=true`
     *
     * @param {StationPositionPacket} stationPacket - The station position information to upload
     * @returns {Promise<void>} A promise that resolves when the upload is complete
     * @example
     * await uploader.uploadStationPosition({
     *   uploader_callsign: 'MYCALL',
     *   uploader_position: [51.5074, -0.1278, 100],
     *   uploader_antenna: 'Diamond X-50',
     *   mobile: false
     * });
     */
    public async uploadStationPosition(stationPacket: StationPositionPacket): Promise<void> {
        const payload = {
            software_name: this.uploaderConfig.software_name,
            software_version: this.uploaderConfig.software_version,
            uploader_callsign: stationPacket.uploader_callsign,
            uploader_position: stationPacket.uploader_position,
            uploader_radio: stationPacket.uploader_radio,
            uploader_antenna: stationPacket.uploader_antenna || this.uploaderConfig.uploader_antenna,
            uploader_contact_email: stationPacket.uploader_contact_email,
            mobile: stationPacket.mobile ?? false,
        };

        await this.putWithRetry(Uploader.SONDEHUB_AMATEUR_STATION_POSITION_URL, payload, `station position of ${stationPacket.uploader_callsign}`);
    }

    private scheduleNextUpload() {
        if (this.stopped) {
            return;
        }

        this.timeoutId = setTimeout(() => this.processQueue(), this.uploaderConfig.uploadRate);
        this.timeoutId.unref();
    }

    private async processQueue() {
        const queue = this.telemetryQueue;
        this.telemetryQueue = [];

        if (queue.length) {
            const delivered = await this.uploadTelemetryPackets(queue);

            // packets are only dropped once sondehub has taken them, otherwise they wait for the next cycle
            if (!delivered) {
                this.telemetryQueue = [...queue, ...this.telemetryQueue];
            }
        }

        this.scheduleNextUpload();
    }

    private uploadTelemetryPackets(packets: TelemetryPacket[]): Promise<boolean> {
        return this.putWithRetry(Uploader.SONDEHUB_AMATEUR_URL, packets, `${packets.length} telemetry packets`);
    }

    /** @description Resolves false only when the payload is still worth retrying later, a rejected payload is not */
    private async putWithRetry(url: string, payload: JSONValue | TelemetryPacket[] | StationPositionPacket, description: string): Promise<boolean> {
        let compressedPayload: Buffer;

        try {
            compressedPayload = await this.compress(payload);
        } catch (error) {
            this.logError(`Error compressing ${description}, dropping it: ${error}`);
            return true;
        }

        const headers = {
            'User-Agent': `${this.uploaderConfig.software_name}-${this.uploaderConfig.software_version}`,
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
        };

        for (let attempt = 1; attempt <= this.uploaderConfig.uploadRetries; attempt++) {
            try {
                const response = await axios.put(url, compressedPayload, {
                    headers,
                    timeout: this.uploaderConfig.uploadTimeout,
                    validateStatus: () => true,
                });

                if (response.status === 200) {
                    this.logInfo(`Uploaded ${description}.`);
                    return true;
                }

                if (response.status === 202) {
                    this.logInfo(`Accepted ${description} in test mode.`);
                    return true;
                }

                // sondehub asks clients to retry server errors only, anything else would fail again the same way
                if (!this.isRetriable(response.status)) {
                    this.logError(`Failed to upload ${description}. Status: ${response.status}, Message: ${response.statusText}`);
                    return true;
                }

                this.logDebug(`Sondehub is busy (status ${response.status}), attempt ${attempt} of ${this.uploaderConfig.uploadRetries}.`);
            } catch (error) {
                this.logDebug(`Error uploading ${description}, attempt ${attempt} of ${this.uploaderConfig.uploadRetries}: ${error}`);
            }

            if (attempt < this.uploaderConfig.uploadRetries) {
                await this.delay(this.uploaderConfig.uploadRetryDelay);
            }
        }

        this.logError(`Upload of ${description} failed after ${this.uploaderConfig.uploadRetries} attempts.`);
        return false;
    }

    private isRetriable(status: number) {
        return status >= 500;
    }

    private delay(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms).unref();
        });
    }

    private enhanceTelemetryPacket(packet: TelemetryPacket): TelemetryPacket {
        const enhancedPacket = { ...packet };
        enhancedPacket.software_name = this.uploaderConfig.software_name;
        enhancedPacket.software_version = this.uploaderConfig.software_version;

        if (!packet.uploader_callsign) {
            enhancedPacket.uploader_callsign = this.uploaderConfig.uploader_callsign;
        }

        if (!packet.uploader_position) {
            enhancedPacket.uploader_position = this.uploaderConfig.uploader_position;
        }

        if (!packet.time_received) {
            enhancedPacket.time_received = new Date().toISOString();
        }

        enhancedPacket.dev = this.uploaderConfig.dev ? 'true' : undefined;

        return enhancedPacket;
    }

    private compress(data: JSONValue | TelemetryPacket[] | StationPositionPacket): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            gzip(JSON.stringify(data), (error, compressedData) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(compressedData);
            });
        });
    }

    private logDebug(message: string): void {
        if (this.uploaderConfig.logLevel === 'debug') {
            if (this.uploaderConfig.logger?.debug) {
                this.uploaderConfig.logger.debug(message);
            } else {
                console.debug(`Sondehub Uploader: ${message}`);
            }
        }
    }

    private logInfo(message: string): void {
        if (this.uploaderConfig.logLevel === 'debug' || this.uploaderConfig.logLevel === 'info') {
            if (this.uploaderConfig.logger?.info) {
                this.uploaderConfig.logger.info(message);
            } else {
                console.info(`Sondehub Uploader: ${message}`);
            }
        }
    }

    private logError(message: string): void {
        if (this.uploaderConfig.logLevel !== 'none') {
            if (this.uploaderConfig.logger?.error) {
                this.uploaderConfig.logger.error(message);
            } else {
                console.error(`Sondehub Uploader: ${message}`);
            }
        }
    }
}
