import type { ColumnType, Generated, Insertable, Kysely, Selectable, Updateable } from 'kysely';

export interface Database {
    vehicles: VehicleTable;
    beacons: BeaconTable;
    vehicle_types: VehicleTypeTable;
}

export type DatabaseInstance = Kysely<Database>;

export interface VehicleTable {
    id: Generated<number>;
    callsign: ColumnType<string, string, never>;
    description: ColumnType<string | undefined>;
    created_at: ColumnType<Date, string, never>;
    deleted_at: ColumnType<Date | null, never, Date>;
    vehicle_type_id: ColumnType<number>;
}
export type Vehicle = Selectable<VehicleTable>;
export type NewVehicle = Insertable<VehicleTable>;
export type VehicleUpdate = Updateable<VehicleTable>;

export interface BeaconTable {
    id: Generated<number>;
    callsign: ColumnType<string, string, never>;
    vehicle_id: ColumnType<number>;
}
export type Beacon = Selectable<BeaconTable>;
export type NewBeacon = Insertable<BeaconTable>;
export type BeaconUpdate = Updateable<BeaconTable>;

export interface VehicleTypeTable {
    id: Generated<number>;
    name: ColumnType<string>;
    is_station: ColumnType<boolean>;
}
export type VehicleType = Selectable<VehicleTypeTable>;
export type NewVehicleType = Insertable<VehicleTypeTable>;
export type VehicleTypeUpdate = Updateable<VehicleTypeTable>;
