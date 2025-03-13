import { sql } from "kysely";
import { DatabaseInstance, NewBeacon, NewVehicle } from "./database";

export class VehiclesRepository {
    constructor(private readonly db: DatabaseInstance) {}

    // ======== CREATE ===========
    public async createVehicle(vehicle: NewVehicle) {
        return await this.db.insertInto('vehicles').values(vehicle).returningAll().executeTakeFirstOrThrow();
    }

    public async createBeacons(beacons: NewBeacon[]) {
        return await this.db.insertInto('beacons').values(beacons).execute();
    }


    // ======== READ ===========
    public async getVehicleById(vehicleId: number) {
        return await this.db.selectFrom('vehicles').selectAll().where('id', '=', vehicleId).executeTakeFirst();
    }

    public async getVehicles() {
        return await this.db.selectFrom('vehicles').selectAll().execute();
    }

    public async getBeacons(vehicleId: number) {
        return await this.db.selectFrom('beacons').select(['callsign']).where('vehicle_id', '=', vehicleId).execute();
    }

    public async getBeaconByCallsign(callsign: string) {
        return await this.db.selectFrom('beacons').selectAll().where('callsign', '=', callsign).executeTakeFirst();
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
