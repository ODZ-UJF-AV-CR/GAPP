import { Static, Type as T } from '@sinclair/typebox';

/** @deprecated */
export const Q_Callsign = T.Object({
    callsign: T.String(),
});

/** @deprecated */
export const Q_OptionalCallsign = T.Object(
    {
        callsign: T.Optional(T.String()),
    },
    { nullable: true }
);

/** @deprecated */
export const B_CarTelemetry = T.Object({
    latitude: T.Number(),
    longitude: T.Number(),
    altitude: T.Number(),
    callsign: T.String(),
});
/** @deprecated */
export type CarTelemetry = Static<typeof B_CarTelemetry>;

/** @deprecated */
export const B_VesselTelemetry = T.Object({
    latitude: T.Number(),
    longitude: T.Number(),
    altitude: T.Number(),
    callsign: T.String(),
    received_at: T.String(),
    course: T.Optional(T.Number()),
    speed_mps: T.Optional(T.Number()),
});
/** @deprecated */
export type VesselTelemetry = Static<typeof B_VesselTelemetry>;

export const B_SondeTtnTelemetry = T.Object({
    end_device_ids: T.Object({
        device_id: T.String(),
    }),
    received_at: T.String(),
    uplink_message: T.Object({
        f_port: T.Number(),
        f_cnt: T.Number(),
        frm_payload: T.String(),
        decoded_payload: T.Object({
            alt_m: T.Number(),
            alt_okay: T.Number(),
            course: T.Number(),
            course_ok: T.Number(),
            lat: T.Number(),
            latlon_age_s: T.Number(),
            latlon_ok: T.Number(),
            lon: T.Number(),
            speed_mps: T.Number(),
            speed_ok: T.Number(),
        }),
        rx_metadata: T.Array(
            T.Object({
                gateway_ids: T.Object({
                    gateway_id: T.String(),
                    eui: T.String(),
                }),
                timestamp: T.Number(),
                rssi: T.Number(),
                signal_rssi: T.Optional(T.Number()),
                channel_rssi: T.Optional(T.Number()),
                snr: T.Number(),
                uplink_token: T.String(),
                received_at: T.String(),
            })
        ),
        settings: T.Object({
            data_rate: T.Object({
                lora: T.Object({
                    bandwidth: T.Number(),
                    spreading_factor: T.Number(),
                    coding_rate: T.String(),
                }),
            }),
            frequency: T.String(),
            timestamp: T.Number(),
        }),
        received_at: T.String(),
        consumed_airtime: T.String(),
        locations: T.Object({
            'frm-payload': T.Object({
                latitude: T.Number(),
                longitude: T.Number(),
                source: T.String(),
            }),
        }),
        network_ids: T.Object({
            net_id: T.String(),
            ns_id: T.String(),
            tenant_id: T.String(),
            cluster_id: T.String(),
            cluster_address: T.String(),
        }),
    }),
});

/** @deprecated */
export const R_CarsStatus = T.Array(
    T.Object({
        _time: T.String(),
        altitude: T.Number(),
        longitude: T.Number(),
        latitude: T.Number(),
        callsign: T.String(),
    })
);

/** @deprecated */
export type CarsStatus = Static<typeof R_CarsStatus>;

/** @deprecated */
export const R_CallsignLocation = T.Object({
    _time: T.String(),
    altitude: T.Number(),
    callsign: T.String(),
    latitude: T.Number(),
    longitude: T.Number(),
    result: T.String(),
    table: T.Number(),
});

/** @deprecated */
export type CallsignLocation = Static<typeof R_CallsignLocation>;
