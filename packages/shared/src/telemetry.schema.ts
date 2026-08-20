import { type Static, Type as T } from '@fastify/type-provider-typebox';

/**
 * Only the fields GAPP actually consumes are required. TTN omits metadata branches
 * depending on gateway, payload formatter and GPS lock, requiring them rejects valid uplinks.
 */
export const TtnTelemetrySchema = T.Object({
    end_device_ids: T.Object({
        device_id: T.String(),
    }),
    received_at: T.Optional(T.String()),
    uplink_message: T.Object({
        f_port: T.Optional(T.Number()),
        f_cnt: T.Optional(T.Number()),
        frm_payload: T.Optional(T.String()),
        decoded_payload: T.Object({
            lat: T.Number(),
            lon: T.Number(),
            alt_m: T.Number(),
            course: T.Optional(T.Number()),
            speed_mps: T.Optional(T.Number()),
            alt_okay: T.Optional(T.Number()),
            course_ok: T.Optional(T.Number()),
            latlon_age_s: T.Optional(T.Number()),
            latlon_ok: T.Optional(T.Number()),
            speed_ok: T.Optional(T.Number()),
        }),
        rx_metadata: T.Optional(
            T.Array(
                T.Object({
                    gateway_ids: T.Optional(
                        T.Object({
                            gateway_id: T.Optional(T.String()),
                            eui: T.Optional(T.String()),
                        }),
                    ),
                    timestamp: T.Optional(T.Number()),
                    rssi: T.Optional(T.Number()),
                    signal_rssi: T.Optional(T.Number()),
                    channel_rssi: T.Optional(T.Number()),
                    snr: T.Optional(T.Number()),
                    uplink_token: T.Optional(T.String()),
                    received_at: T.Optional(T.String()),
                }),
            ),
        ),
        settings: T.Optional(
            T.Object({
                data_rate: T.Optional(
                    T.Object({
                        lora: T.Optional(
                            T.Object({
                                bandwidth: T.Optional(T.Number()),
                                spreading_factor: T.Optional(T.Number()),
                                coding_rate: T.Optional(T.String()),
                            }),
                        ),
                    }),
                ),
                frequency: T.Optional(T.String()),
                timestamp: T.Optional(T.Number()),
            }),
        ),
        received_at: T.String(),
        consumed_airtime: T.Optional(T.String()),
        locations: T.Optional(
            T.Object({
                'frm-payload': T.Optional(
                    T.Object({
                        latitude: T.Optional(T.Number()),
                        longitude: T.Optional(T.Number()),
                        source: T.Optional(T.String()),
                    }),
                ),
            }),
        ),
        network_ids: T.Optional(
            T.Object({
                net_id: T.Optional(T.String()),
                ns_id: T.Optional(T.String()),
                tenant_id: T.Optional(T.String()),
                cluster_id: T.Optional(T.String()),
                cluster_address: T.Optional(T.String()),
            }),
        ),
    }),
});
export type TtnTelemetry = Static<typeof TtnTelemetrySchema>;

const telemetryProperties = {
    callsign: T.String({ minLength: 1, description: 'Beacon callsign the packet was received from' }),
    latitude: T.Number({ minimum: -90, maximum: 90, description: 'Decimal degrees WGS84' }),
    longitude: T.Number({ minimum: -180, maximum: 180, description: 'Decimal degrees WGS84' }),
    altitude: T.Number({ description: 'Meters above mean sea level' }),
    _time: T.String({ format: 'date-time', description: 'Time the receiver got the packet, ISO-8601' }),

    velocity_horizontal: T.Optional(T.Number({ description: 'Ground speed in m/s' })),
    velocity_vertical: T.Optional(T.Number({ description: 'Ascent rate in m/s, negative when descending' })),
    heading: T.Optional(T.Number({ minimum: 0, maximum: 360, description: 'Course over ground in degrees true' })),
    satellites: T.Optional(T.Integer({ minimum: 0, description: 'Satellites used in the position solution' })),
    battery: T.Optional(T.Number({ description: 'Battery voltage in volts' })),
    temperature: T.Optional(T.Number({ description: 'Internal temperature in degrees Celsius' })),
    humidity: T.Optional(T.Number({ description: 'Relative humidity in percent' })),
    pressure: T.Optional(T.Number({ description: 'Pressure in hPa' })),
    frame: T.Optional(T.Integer({ minimum: 0, description: 'Frame counter, ideally unique over the flight' })),

    snr: T.Optional(T.Number({ description: 'Signal to noise ratio of the received signal in dB' })),
    rssi: T.Optional(T.Number({ description: 'Received signal strength in dBm' })),
    frequency: T.Optional(T.Number({ description: 'Transmit frequency in MHz' })),
};

export const GenericTelemetrySchema = T.Object(telemetryProperties, { additionalProperties: false });
export type GenericTelemetry = Static<typeof GenericTelemetrySchema>;

/** @description Telemetry enriched with the resolved uploader, this is what gets stored and streamed */
export const TelemetryRecordSchema = T.Object(
    { ...telemetryProperties, uploader_callsign: T.Optional(T.String({ description: 'Callsign of the station that uploaded the packet' })) },
    { additionalProperties: false },
);
export type TelemetryRecord = Static<typeof TelemetryRecordSchema>;

export const TelemetryQuerySchema = T.Object(
    {
        uploaded_by: T.Optional(T.String({ description: 'Callsign of the station uploading the packet, must be a station vehicle' })),
        modulation: T.Optional(T.String({ minLength: 1, description: 'Modulation shown on the SondeHub tracker, defaults to GFSK' })),
    },
    { nullable: true },
);
export type TelemetryQuery = Static<typeof TelemetryQuerySchema>;

export const VehicleTelemetryStreamSchema = T.Object({
    telemetry: T.Array(TelemetryRecordSchema),
});
export type VehicleTelemetryStream = Static<typeof VehicleTelemetryStreamSchema>;
