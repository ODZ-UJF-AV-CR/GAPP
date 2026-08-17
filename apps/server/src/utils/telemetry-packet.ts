import type { GenericTelemetry, TtnTelemetry } from '@gapp/shared';
import type { TelemetryPacket as SondehubTelemetryPacket, StationPositionPacket } from '@gapp/sondehub';

export interface TelemetryPacketOptions {
    modulation?: SondehubTelemetryPacket['modulation'];
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
            heading: this.telemetry.heading as number,
            batt: this.telemetry.batt as number,
            snr: this.telemetry.snr as number,
            rssi: this.telemetry.rssi as number,
            vel_h: this.telemetry.velocity_horizontal as number,
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
        super(telemetry, { modulation: 'GFSK', ...options });
    }
}

export class TelemetryPacketFromTtn extends TelemetryPacket {
    constructor(ttnPayload: TtnTelemetry) {
        super(
            {
                _time: ttnPayload.uplink_message.received_at,
                callsign: ttnPayload.end_device_ids.device_id,
                latitude: ttnPayload.uplink_message.decoded_payload.lat,
                longitude: ttnPayload.uplink_message.decoded_payload.lon,
                altitude: ttnPayload.uplink_message.decoded_payload.alt_m,
                heading: ttnPayload.uplink_message.decoded_payload.course,
                velocity_horizontal: ttnPayload.uplink_message.decoded_payload.speed_mps,
            },
            {
                modulation: 'LoRa',
                uploader_callsign: 'TTN_Gateway',
            },
        );
    }
}
