import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { DatabaseInstance, NewBeacon, NewVehicle } from './postgres-database.ts';

export class VehiclesRepository {
    /** @description Returns a query builder for the vehicles with beacons json */
    private getVehiclesQuery(includeDeleted = false) {
        return this.db
            .selectFrom('vehicles')
            .selectAll()
            .select((db) => [
                jsonArrayFrom(db.selectFrom('beacons').select(['beacons.callsign']).whereRef('beacons.vehicle_id', '=', 'vehicles.id')).as('beacons'),
                db
                    .selectFrom('vehicle_types')
                    .select(['vehicle_types.is_station'])
                    .whereRef('vehicle_types.id', '=', 'vehicles.vehicle_type_id')
                    .as('is_station'),
            ])
            .$if(!includeDeleted, (qb) => qb.where('vehicles.deleted_at', 'is', null));
    }

    constructor(private readonly db: DatabaseInstance) {}

    // ======== CREATE ===========
    public async createVehicle(vehicle: NewVehicle) {
        return await this.db.insertInto('vehicles').values(vehicle).returningAll().executeTakeFirstOrThrow();
    }

    public async createVehicleWithBeacons(vehicle: NewVehicle, beacons: NewBeacon[]) {
        return this.db.transaction().execute(async (trx) => {
            const createdVehicle = await trx.insertInto('vehicles').values(vehicle).returningAll().executeTakeFirstOrThrow();
            const beaconsWithVehicleId = beacons.map((beacon) => ({ ...beacon, vehicle_id: createdVehicle.id }));
            const createdBeacons = await trx.insertInto('beacons').values(beaconsWithVehicleId).returningAll().execute();

            return { ...createdVehicle, beacons: createdBeacons };
        });
    }

    public async createBeacons(beacons: NewBeacon[]) {
        return await this.db.insertInto('beacons').values(beacons).execute();
    }

    // ======== READ ===========
    public async getVehicleById(vehicleId: number, includeDeleted = false) {
        return await this.getVehiclesQuery(includeDeleted).where('id', '=', vehicleId).executeTakeFirst();
    }

    public async getVehicleByBeaconCallsign(callsign: string, includeDeleted = false) {
        return await this.db
            .selectFrom('beacons')
            .innerJoin('vehicles', 'beacons.vehicle_id', 'vehicles.id')
            .innerJoin('vehicle_types', 'vehicles.vehicle_type_id', 'vehicle_types.id')
            .select(['vehicles.id', 'vehicles.name', 'vehicles.description', 'vehicle_types.is_station', 'vehicle_types.type_name'])
            .where('beacons.callsign', '=', callsign)
            .$if(!includeDeleted, (qb) => qb.where('vehicles.deleted_at', 'is', null))
            .executeTakeFirst();
    }

    public async getVehicles(includeDeleted = false) {
        return await this.getVehiclesQuery(includeDeleted).execute();
    }

    public async getBeacons() {
        return await this.db.selectFrom('beacons').selectAll().execute();
    }

    public async getBeaconByCallsign(callsign: string) {
        return await this.db.selectFrom('beacons').selectAll().where('callsign', '=', callsign).executeTakeFirst();
    }

    public async getBeaconsByVehicleId(vehicleId: number) {
        return await this.db.selectFrom('beacons').select(['id', 'callsign']).where('vehicle_id', '=', vehicleId).execute();
    }

    public async getVehicleTypes() {
        return await this.db.selectFrom('vehicle_types').selectAll().execute();
    }

    // ======== UPDATE ===========
    public async softDeleteVehicle(vehicleId: number) {
        await this.db.updateTable('vehicles').set({ deleted_at: sql`now()` }).where('id', '=', vehicleId).execute();
    }

    public async restoreVehicle(vehicleId: number) {
        return await this.db.updateTable('vehicles').set({ deleted_at: null }).where('id', '=', vehicleId).execute();
    }

    // ======== DELETE ===========
    public async hardDeleteVehicle(vehicleId: number) {
        await this.db.deleteFrom('vehicles').where('id', '=', vehicleId).execute();
    }
}
