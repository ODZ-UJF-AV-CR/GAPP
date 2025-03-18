import axios from 'axios';
import { gzip } from 'node:zlib';

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

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
    telemetry_hidden?: boolean;
    historical?: boolean;
    upload_time?: string;
    modulation?: 'APRS' | 'Hours Binary' | 'RTTY' | 'LoRa' | 'WSPR';
}

type StationBasePayload = Partial<Omit<BasePacket, 'uploader_callsign' | 'uploader_position'>> &
    Required<Pick<BasePacket, 'uploader_callsign' | 'uploader_position'>>;

export interface StationPositionPacket extends StationBasePayload {
    uploader_radio?: string;
    uploader_contact_email?: string;
    mobile?: boolean;
}

interface UploaderConfig extends BasePacket {
    /** @description how often packets will be sent to sondehub (in ms) */
    uploadRate: number;
    uploadTimeout: number;
    /** @todo implement */
    uploadRetries: number;
    dev: boolean;
}

type MinimalUploaderConfig = Partial<Omit<UploaderConfig, 'uploader_Callsign'>> & Pick<UploaderConfig, 'uploader_callsign'>;

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
    private uploaderConfig: UploaderConfig = {
        uploader_callsign: '',
        uploadRate: 5_000,
        uploadTimeout: 20_000,
        uploadRetries: 5,
        dev: false,
        software_name: 'node-sondehub',
        software_version: '0.0.1',
    };

    private telemetryQueue: TelemetryPacket[] = [];

    public static readonly SONDEHUB_AMATEUR_URL = 'https://api.v2.sondehub.org/amateur/telemetry';
    public static readonly SONDEHUB_AMATEUR_STATION_POSITION_URL = 'https://api.v2.sondehub.org/amateur/listeners';

    constructor(options: MinimalUploaderConfig) {
        this.uploaderConfig = {
            ...this.uploaderConfig,
            ...options,
        };

        this.timeoutId = setTimeout(() => this.processQueue(), this.uploaderConfig.uploadRate);
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
        this.timeoutId.unref();

        if (this.telemetryQueue.length) {
            await this.uploadTelemetryPackets(this.telemetryQueue);
        }
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

        try {
            const compressedPayload = await this.compress(payload);
            const headers = {
                'User-Agent': `${this.uploaderConfig.software_name}-${this.uploaderConfig.software_version}`,
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            };
            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_STATION_POSITION_URL, compressedPayload, {
                headers,
                timeout: this.uploaderConfig.uploadTimeout,
            });

            if (response.status === 200) {
                this.logInfo('Station position uploaded successfully.');
            } else {
                this.logError(`Failed to upload station position. Status: ${response.status}, Message: ${response.statusText}`);
            }
        } catch (error) {
            this.logError(`Error uploading station position: ${error}`);
        }
    }

    private async processQueue() {
        if (!this.telemetryQueue.length) {
            this.timeoutId = setTimeout(() => this.processQueue(), this.uploaderConfig.uploadRate);
            return;
        }

        const queue = [...this.telemetryQueue];
        this.telemetryQueue = [];

        await this.uploadTelemetryPackets(queue);

        this.timeoutId.unref();
        this.timeoutId = setTimeout(() => this.processQueue(), this.uploaderConfig.uploadRate);
    }

    private async uploadTelemetryPackets(packets: TelemetryPacket[]): Promise<void> {
        try {
            const compressedPayload = await this.compress(packets);
            const headers = {
                'User-Agent': `${this.uploaderConfig.software_name}-${this.uploaderConfig.software_version}`,
                'Content-Encoding': 'gzip',
                'Content-Type': 'application/json',
            };

            const response = await axios.put(Uploader.SONDEHUB_AMATEUR_URL, compressedPayload, {
                headers,
                timeout: this.uploaderConfig.uploadTimeout,
            });

            if (response.status === 200) {
                this.logInfo(`Uploaded ${packets.length} telemetry packets.`);
            } else {
                this.logError(`Failed to upload telemetry. Status: ${response.status}, Message: ${response.statusText}`);
            }
        } catch (error) {
            console.log(error);
            this.logError(`Error uploading telemetry: ${error}`);
        }
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
        return new Promise((resolve) => {
            gzip(JSON.stringify(data), (error, compressedData) => {
                if (error) {
                    this.logError(error.message);
                }
                resolve(compressedData);
            });
        });
    }

    private logDebug(message: string): void {
        console.debug(`Sondehub Uploader: ${message}`);
    }

    private logInfo(message: string): void {
        console.info(`Sondehub Uploader: ${message}`);
    }

    private logError(message: string): void {
        console.error(`Sondehub Uploader: ${message}`);
    }
}
