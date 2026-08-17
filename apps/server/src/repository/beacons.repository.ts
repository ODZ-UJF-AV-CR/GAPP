import type { DatabaseInstance, NewBeacon } from './postgres-database.ts';

export class BeaconsRepository {
    constructor(private readonly db: DatabaseInstance) {}

    /** @description Beacons of soft deleted vehicles stay in the table but must not be listed */
    private getBeaconsQuery() {
        return this.db
            .selectFrom('beacons')
            .innerJoin('vehicles', 'beacons.vehicle_id', 'vehicles.id')
            .select(['beacons.id', 'beacons.callsign', 'beacons.vehicle_id'])
            .where('vehicles.deleted_at', 'is', null);
    }

    // ======== CREATE ===========
    public async createBeacons(beacons: NewBeacon[]) {
        return await this.db.insertInto('beacons').values(beacons).returningAll().execute();
    }

    // ======== READ ===========
    public async getBeacons() {
        return await this.getBeaconsQuery().execute();
    }

    public async getBeaconsByVehicleId(vehicleId: number) {
        return await this.getBeaconsQuery().where('beacons.vehicle_id', '=', vehicleId).execute();
    }

    /** @description Includes beacons of soft deleted vehicles, callsigns stay globally unique */
    public async getBeaconByCallsign(callsign: string) {
        return await this.db.selectFrom('beacons').selectAll().where('callsign', '=', callsign).executeTakeFirst();
    }

    // ======== DELETE ===========
    public async deleteBeacon(beaconId: number) {
        const result = await this.db.deleteFrom('beacons').where('id', '=', beaconId).executeTakeFirst();
        return Number(result.numDeletedRows);
    }
}
