import { ColumnType, Generated, Insertable, type Kysely, Selectable, Updateable } from 'kysely';

export interface Database {
    vehicles: VehicleTable;
    vehicle_types: VehicleTypeTable;
    beacons: BeaconTable;
}

export type DatabaseInstance = Kysely<Database>;

export interface VehicleTable {
    id: Generated<number>;
    callsign: ColumnType<string, string, never>;
    created_at: ColumnType<Date, string, never>;
    deleted_at: ColumnType<Date | undefined, never, Date>;
    type: ColumnType<number>;
}
export type Vehicle = Selectable<VehicleTable>;
export type NewVehicle = Insertable<VehicleTable>;
export type VehicleUpdate = Updateable<VehicleTable>;

export interface VehicleTypeTable {
    id: Generated<string>;
    name: ColumnType<string>;
}
export type VehicleType = Selectable<VehicleTypeTable>;
export type NewVehicleType = Insertable<VehicleTypeTable>;
export type VehicleTypeUpdate = Updateable<VehicleTypeTable>;

export interface BeaconTable {
    id: Generated<number>;
    callsign: ColumnType<string, string, never>;
    vehicle_id: ColumnType<number>;
}
export type Beacon = Selectable<BeaconTable>;
export type NewBeacon = Insertable<BeaconTable>;
export type BeaconUpdate = Updateable<BeaconTable>;
