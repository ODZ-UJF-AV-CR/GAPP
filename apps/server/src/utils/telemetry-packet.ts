import type { GenericTelemetry, TtnTelemetry } from '@gapp/shared';
import type { Modulation, TelemetryPacket as SondehubTelemetryPacket, StationPositionPacket } from '@gapp/sondehub';

export interface TelemetryPacketOptions {
    modulation?: Modulation;
    uploader_callsign?: SondehubTelemetryPacket['uploader_callsign'];
}

export abstract class TelemetryPacket {
    constructor(
        private readonly telemetry: GenericTelemetry,
        private readonly _options: TelemetryPacketOptions = {},
    ) {}

    public get data() {
        return this.telemetry;
    }

    public get options() {
        return this._options;
    }

    public sondehubPacket(payloadCallsign = this.telemetry.callsign): SondehubTelemetryPacket {
        return {
            // GAPP relays packets from receivers, payloads carry no GPS time, so receive time is the best datetime we have
            time_received: this.telemetry._time,
            payload_callsign: payloadCallsign,
            datetime: this.telemetry._time,
            lat: this.telemetry.latitude,
            lon: this.telemetry.longitude,
            alt: this.telemetry.altitude,
            modulation: this._options.modulation,
            uploader_callsign: this._options.uploader_callsign || 'GAPP-Server',
            vel_h: this.telemetry.velocity_horizontal,
            vel_v: this.telemetry.velocity_vertical,
            heading: this.telemetry.heading,
            sats: this.telemetry.satellites,
            batt: this.telemetry.battery,
            temp: this.telemetry.temperature,
            humidity: this.telemetry.humidity,
            pressure: this.telemetry.pressure,
            frame: this.telemetry.frame,
            snr: this.telemetry.snr,
            rssi: this.telemetry.rssi,
            frequency: this.telemetry.frequency,
        };
    }

    public sondehubStationPosition(uploaderCallsign = this.telemetry.callsign): StationPositionPacket {
        return {
            uploader_callsign: uploaderCallsign,
            uploader_position: [this.telemetry.latitude, this.telemetry.longitude, this.telemetry.altitude],
            mobile: true,
        };
    }
}

export class TelemetryPacketGeneral extends TelemetryPacket {
    constructor(telemetry: GenericTelemetry, options: TelemetryPacketOptions = {}) {
        // SiK radios used by the ground stations are GFSK, callers may override per packet
        super(telemetry, { ...options, modulation: options.modulation ?? 'GFSK' });
    }
}

export class TelemetryPacketFromTtn extends TelemetryPacket {
    constructor(ttnPayload: TtnTelemetry) {
        const { decoded_payload, received_at } = ttnPayload.uplink_message;

        super(
            {
                _time: received_at,
                callsign: ttnPayload.end_device_ids.device_id,
                latitude: decoded_payload.lat,
                longitude: decoded_payload.lon,
                altitude: decoded_payload.alt_m,
                heading: decoded_payload.course,
                velocity_horizontal: decoded_payload.speed_mps,
            },
            {
                modulation: 'LoRa',
                uploader_callsign: 'TTN_Gateway',
            },
        );
    }
}
