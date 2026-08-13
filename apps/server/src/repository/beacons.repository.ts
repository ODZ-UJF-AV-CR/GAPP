import type { DatabaseInstance, NewBeacon } from './postgres-database.ts';

export class BeaconsRepository {
    constructor(private readonly db: DatabaseInstance) {}

    // ======== CREATE ===========
    public async createBeacons(beacons: NewBeacon[]) {
        return await this.db.insertInto('beacons').values(beacons).returningAll().execute();
    }

    // ======== READ ===========
    public async getBeacons() {
        return await this.db.selectFrom('beacons').selectAll().execute();
    }

    public async getBeaconsByVehicleId(vehicleId: number) {
        return await this.db.selectFrom('beacons').selectAll().where('vehicle_id', '=', vehicleId).execute();
    }

    public async getBeaconByCallsign(callsign: string) {
        return await this.db.selectFrom('beacons').selectAll().where('callsign', '=', callsign).executeTakeFirst();
    }

    // ======== DELETE ===========
    public async deleteBeacon(beaconId: number) {
        const result = await this.db.deleteFrom('beacons').where('id', '=', beaconId).executeTakeFirst();
        return Number(result.numDeletedRows);
    }
}
