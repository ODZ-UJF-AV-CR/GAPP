import type { ColumnType, Generated, Insertable, Kysely, Selectable, Updateable } from 'kysely';

export interface Database {
    vehicles: VehicleTable;
    beacons: BeaconTable;
    vehicle_types: VehicleTypeTable;
}

export type DatabaseInstance = Kysely<Database>;

export interface VehicleTable {
    id: Generated<number>;
    name: string;
    description: string | undefined;
    created_at: ColumnType<Date, never, never>;
    deleted_at: ColumnType<Date | null, never, Date | null>;
    vehicle_type_id: number;
    upload_aggregation: ColumnType<boolean, boolean | undefined, boolean | undefined>;
    upload_beacons: ColumnType<boolean, boolean | undefined, boolean | undefined>;
}
export type Vehicle = Selectable<VehicleTable>;
export type NewVehicle = Insertable<VehicleTable>;
export type VehicleUpdate = Updateable<VehicleTable>;

export interface BeaconTable {
    id: Generated<number>;
    callsign: string;
    vehicle_id: number;
}
export type Beacon = Selectable<BeaconTable>;
export type NewBeacon = Insertable<BeaconTable>;
export type BeaconUpdate = Updateable<BeaconTable>;

export interface VehicleTypeTable {
    id: Generated<number>;
    type_name: string;
    is_station: boolean;
}
export type VehicleType = Selectable<VehicleTypeTable>;
export type NewVehicleType = Insertable<VehicleTypeTable>;
export type VehicleTypeUpdate = Updateable<VehicleTypeTable>;
