import { NewBeacon, NewVehicle } from "../repository/postgres-database";
import { VehiclesRepository } from "../repository/vehicles.repository";

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public async createVehicle(data: { vehicle: NewVehicle, beacons: NewBeacon[] }) {
        const createdVehicle = await this.vehiclesRepository.createVehicle(data.vehicle);

        const beaconsWithVehicleId = data.beacons.map((b) => ({...b, vehicle_id: createdVehicle.id, callsign: b.callsign || '' }));

        try {
            await this.vehiclesRepository.createBeacons(beaconsWithVehicleId);
        } catch(e) {
            await this.vehiclesRepository.hardDeleteVehicle(createdVehicle.id);
            throw e;
        }

        return {
            ...createdVehicle,
            beacons: beaconsWithVehicleId
        };
    }

    public async getVehicles() {
        const vehicles = await this.vehiclesRepository.getVehicles();

        return vehicles;
    }

    public async deleteVehicle(id: number, force = false): Promise<void> {
        if (force) {
            return await this.vehiclesRepository.hardDeleteVehicle(id);
        } else {
            return await this.vehiclesRepository.softDeleteVehicle(id);
        }
    }

    public async isValidCallsign(callsign: string): Promise<boolean> {
        const beacon = await this.vehiclesRepository.getBeaconByCallsign(callsign);

        return !!beacon;
    }
}
