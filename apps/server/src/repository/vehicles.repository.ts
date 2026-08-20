import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { ConflictError } from '../utils/errors.ts';
import { escapeLikePrefix } from '../utils/escape-like-prefix.ts';
import type { DatabaseExecutor, DatabaseInstance, NewVehicle, VehicleTableUpdate } from './postgres-database.ts';

const MAX_CALLSIGN_SUFFIX = 100;

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
    /** @description Creates the vehicle together with its initial beacon, both rows are committed or neither */
    public async createVehicleWithInitialBeacon(vehicle: NewVehicle) {
        return await this.db.transaction().execute(async (trx) => {
            const createdVehicle = await trx.insertInto('vehicles').values(vehicle).returningAll().executeTakeFirstOrThrow();
            const callsign = await this.resolveFreeBeaconCallsign(createdVehicle.name, trx);
            const beacons = await trx
                .insertInto('beacons')
                .values([{ callsign, vehicle_id: createdVehicle.id }])
                .returningAll()
                .execute();

            return { ...createdVehicle, beacons };
        });
    }

    // ======== READ ===========
    public async getVehicles(includeBeacons = false, includeDeleted = false) {
        return await this.getVehiclesQuery(includeBeacons, includeDeleted).execute();
    }

    public async getVehicleById(vehicleId: number, includeBeacons = false, includeDeleted = false) {
        return await this.getVehiclesQuery(includeBeacons, includeDeleted).where('id', '=', vehicleId).executeTakeFirst();
    }

    public async getVehiclesByIds(vehicleIds: number[], includeDeleted = false) {
        if (!vehicleIds.length) {
            return [];
        }

        return await this.getVehiclesQuery(false, includeDeleted).where('id', 'in', vehicleIds).execute();
    }

    public async getVehicleByBeaconCallsign(callsign: string, includeDeleted = false) {
        return await this.db
            .selectFrom('beacons')
            .innerJoin('vehicles', 'beacons.vehicle_id', 'vehicles.id')
            .innerJoin('vehicle_types', 'vehicles.vehicle_type_id', 'vehicle_types.id')
            .select([
                'vehicles.id',
                'vehicles.name',
                'vehicles.description',
                'vehicle_types.is_station',
                'vehicle_types.type_name',
                'vehicles.upload_aggregation',
                'vehicles.upload_beacons',
            ])
            .where('beacons.callsign', '=', callsign)
            .$if(!includeDeleted, (qb) => qb.where('vehicles.deleted_at', 'is', null))
            .executeTakeFirst();
    }

    public async getBeaconCallsignsWithStationFlag(callsigns?: string[], includeDeleted = false) {
        return await this.db
            .selectFrom('beacons')
            .innerJoin('vehicles', 'beacons.vehicle_id', 'vehicles.id')
            .innerJoin('vehicle_types', 'vehicles.vehicle_type_id', 'vehicle_types.id')
            .select(['beacons.callsign', 'vehicle_types.is_station'])
            .$if(!includeDeleted, (qb) => qb.where('vehicles.deleted_at', 'is', null))
            .$if(Boolean(callsigns?.length), (qb) => qb.where('beacons.callsign', 'in', callsigns ?? []))
            .execute();
    }

    public async getVehicleTypes() {
        return await this.db.selectFrom('vehicle_types').selectAll().execute();
    }

    public async getVehicleTypeById(vehicleTypeId: number) {
        return await this.db.selectFrom('vehicle_types').selectAll().where('id', '=', vehicleTypeId).executeTakeFirst();
    }

    // ======== UPDATE ===========
    public async updateVehicle(vehicleId: number, vehicle: VehicleTableUpdate) {
        return await this.db.updateTable('vehicles').set(vehicle).where('id', '=', vehicleId).where('deleted_at', 'is', null).returningAll().executeTakeFirst();
    }

    public async softDeleteVehicle(vehicleId: number) {
        const result = await this.db
            .updateTable('vehicles')
            .set({ deleted_at: sql`now()` })
            .where('id', '=', vehicleId)
            .where('deleted_at', 'is', null)
            .executeTakeFirst();

        return Number(result.numUpdatedRows);
    }

    public async restoreVehicle(vehicleId: number) {
        const result = await this.db
            .updateTable('vehicles')
            .set({ deleted_at: null })
            .where('id', '=', vehicleId)
            .where('deleted_at', 'is not', null)
            .executeTakeFirst();

        return Number(result.numUpdatedRows);
    }

    // ======== DELETE ===========
    public async hardDeleteVehicle(vehicleId: number) {
        const result = await this.db.deleteFrom('vehicles').where('id', '=', vehicleId).executeTakeFirst();
        return Number(result.numDeletedRows);
    }

    /** @description Picks the vehicle name as the beacon callsign, appending the lowest free suffix when it is taken */
    private async resolveFreeBeaconCallsign(name: string, executor: DatabaseExecutor) {
        const taken = await executor
            .selectFrom('beacons')
            .select('callsign')
            .where('callsign', 'like', `${escapeLikePrefix(name)}%`)
            .execute();

        const takenCallsigns = new Set(taken.map((beacon) => beacon.callsign));

        for (let suffix = 0; suffix <= MAX_CALLSIGN_SUFFIX; suffix++) {
            const callsign = suffix === 0 ? name : `${name}_${suffix}`;

            if (!takenCallsigns.has(callsign)) {
                return callsign;
            }
        }

        throw new ConflictError(`Could not find a free beacon callsign for vehicle ${name}.`);
    }
}
