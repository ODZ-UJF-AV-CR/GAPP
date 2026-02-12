import type { TelemetryPacket as SondehubTelemetryPacket, StationPositionPacket } from '@gapp/sondehub';
import type { TelemetryData } from '../repository/telemetry.repository.ts';
import type { TtnTelemetry } from '../schemas/telemetry.schema.ts';

export interface TelemetryPacketOptions {
    modulation?: SondehubTelemetryPacket['modulation'];
    uploader_callsign?: SondehubTelemetryPacket['uploader_callsign'];
}

export abstract class TelemetryPacket {
    constructor(
        private readonly telemetry: TelemetryData,
        private readonly options: TelemetryPacketOptions = {},
    ) {}

    public get data(): TelemetryData {
        return this.telemetry;
    }

    public get sondehubPacket(): SondehubTelemetryPacket {
        return {
            time_received: this.telemetry.timestamp,
            payload_callsign: this.telemetry.callsign,
            datetime: new Date().toISOString(),
            lat: this.telemetry.latitude,
            lon: this.telemetry.longitude,
            alt: this.telemetry.altitude,
            modulation: this.options.modulation || 'LoRa',
            uploader_callsign: this.options.uploader_callsign || 'GAPP-Server',
            heading: this.telemetry.heading as number,
            batt: this.telemetry.batt as number,
            snr: this.telemetry.snr as number,
            rssi: this.telemetry.rssi as number,
            vel_h: this.telemetry.velocity_horizontal as number,
        };
    }

    public get sondehubStationPosition(): StationPositionPacket {
        return {
            uploader_callsign: this.telemetry.callsign,
            uploader_position: [this.telemetry.latitude, this.telemetry.longitude, this.telemetry.altitude],
            mobile: true,
        };
    }
}

export class TelemetryPacketGeneral extends TelemetryPacket {
    constructor(telemetry: TelemetryData, options: TelemetryPacketOptions = {}) {
        super(telemetry, options);
    }
}

export class TelemetryPacketFromTtn extends TelemetryPacket {
    constructor(ttnPayload: TtnTelemetry, options: TelemetryPacketOptions = {}) {
        super(
            {
                timestamp: ttnPayload.uplink_message.received_at,
                callsign: ttnPayload.end_device_ids.device_id,
                latitude: ttnPayload.uplink_message.decoded_payload.lat,
                longitude: ttnPayload.uplink_message.decoded_payload.lon,
                altitude: ttnPayload.uplink_message.decoded_payload.alt_m,
                heading: ttnPayload.uplink_message.decoded_payload.course,
                speed_horizontal: ttnPayload.uplink_message.decoded_payload.speed_mps,
            },
            options,
        );
    }
}
