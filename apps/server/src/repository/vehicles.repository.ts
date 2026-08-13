import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { DatabaseInstance, NewVehicle, VehicleUpdate } from './postgres-database.ts';

export class VehiclesRepository {
    /** @description Returns a query builder for the vehicles, optionally with beacons json */
    private getVehiclesQuery(includeBeacons = false, includeDeleted = false) {
        return this.db
            .selectFrom('vehicles')
            .selectAll()
            .select((db) => [
                db
                    .selectFrom('vehicle_types')
                    .select(['vehicle_types.is_station'])
                    .whereRef('vehicle_types.id', '=', 'vehicles.vehicle_type_id')
                    .as('is_station'),
            ])
            .$if(includeBeacons, (qb) =>
                qb.select((db) => [
                    jsonArrayFrom(db.selectFrom('beacons').select(['beacons.id', 'beacons.callsign']).whereRef('beacons.vehicle_id', '=', 'vehicles.id')).as(
                        'beacons',
                    ),
                ]),
            )
            .$if(!includeDeleted, (qb) => qb.where('vehicles.deleted_at', 'is', null));
    }

    constructor(private readonly db: DatabaseInstance) {}

    // ======== CREATE ===========
    public async createVehicle(vehicle: NewVehicle) {
        return await this.db.insertInto('vehicles').values(vehicle).returningAll().executeTakeFirstOrThrow();
    }

    // ======== READ ===========
    public async getVehicles(includeBeacons = false, includeDeleted = false) {
        return await this.getVehiclesQuery(includeBeacons, includeDeleted).execute();
    }

    public async getVehicleById(vehicleId: number, includeBeacons = false, includeDeleted = false) {
        return await this.getVehiclesQuery(includeBeacons, includeDeleted).where('id', '=', vehicleId).executeTakeFirst();
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

    public async getVehicleTypes() {
        return await this.db.selectFrom('vehicle_types').selectAll().execute();
    }

    public async getVehicleTypeById(vehicleTypeId: number) {
        return await this.db.selectFrom('vehicle_types').selectAll().where('id', '=', vehicleTypeId).executeTakeFirst();
    }

    // ======== UPDATE ===========
    public async updateVehicle(vehicleId: number, vehicle: VehicleUpdate) {
        return await this.db.updateTable('vehicles').set(vehicle).where('id', '=', vehicleId).returningAll().executeTakeFirst();
    }

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
