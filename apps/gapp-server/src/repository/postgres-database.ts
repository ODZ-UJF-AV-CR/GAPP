import { ColumnType, Generated, Insertable, type Kysely, Selectable, Updateable } from 'kysely';

export enum VehicleType {
    BALLOON = 'balloon',
    DRONE = 'drone',
    CAR = 'car',
}

export interface Database {
    vehicles: VehicleTable;
    beacons: BeaconTable;
}

export type DatabaseInstance = Kysely<Database>;

export interface VehicleTable {
    id: Generated<number>;
    callsign: ColumnType<string, string, never>;
    description: ColumnType<string | undefined>;
    created_at: ColumnType<Date, string, never>;
    deleted_at: ColumnType<Date | null, never, Date>;
    type: ColumnType<VehicleType>;
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
