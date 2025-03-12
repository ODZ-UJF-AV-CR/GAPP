import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
    vehicle: VehicleTable;
    vehicle_type: VehicleTypeTable;
    beacon: BeaconTable;
}

export interface VehicleTable {
    callsign: ColumnType<string, string, never>;
    created_at: ColumnType<Date, string, never>;
    type: ColumnType<number>;
}
export type Vehicle = Selectable<VehicleTable>;
export type NewVehicle = Insertable<VehicleTable>;
export type VehicleUpdate = Updateable<VehicleTable>;

export interface VehicleTypeTable {
    id: Generated<string>;
    type: ColumnType<string>;
}
export type VehicleType = Selectable<VehicleTypeTable>;
export type NewVehicleType = Insertable<VehicleTypeTable>;
export type VehicleTypeUpdate = Updateable<VehicleTypeTable>;

export interface BeaconTable {
    callsign: ColumnType<string, string, never>;
    created_at: ColumnType<Date, string, never>;
    vehicle: ColumnType<string>;
}
export type Beacon = Selectable<BeaconTable>;
export type NewBeacon = Insertable<BeaconTable>;
export type BeaconUpdate = Updateable<BeaconTable>;
