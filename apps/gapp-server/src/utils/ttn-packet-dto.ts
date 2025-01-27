import { Static } from '@sinclair/typebox';
import { B_SondeTtnTelemetry } from '../schemas';
import { TelemetryPacket } from '@gapp/sondehub';

export const ttnPacketDto = (ttnPayload: Static<typeof B_SondeTtnTelemetry>): TelemetryPacket => {
    return {
        time_received: ttnPayload.uplink_message.received_at,
        payload_callsign: ttnPayload.end_device_ids.device_id,
        datetime: new Date().toISOString(),
        lat: ttnPayload.uplink_message.decoded_payload.lat,
        lon: ttnPayload.uplink_message.decoded_payload.lon,
        alt: ttnPayload.uplink_message.decoded_payload.alt_m,
        heading: ttnPayload.uplink_message.decoded_payload.course,
        vel_h: ttnPayload.uplink_message.decoded_payload.speed_mps,
        modulation: 'LoRa',
        uploader_callsign: 'GAPP-Server',
    };
};
