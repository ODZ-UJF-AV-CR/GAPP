import type { Vehicle } from '../repository/postgres-database.ts';
import { VehiclesRepository } from '../repository/vehicles.repository.ts';
import type { CreateVehicle } from '../schemas/vehicle.schema.ts';

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public async createVehicle(vehicle: CreateVehicle) {
        const beacons = vehicle.beacons;
        delete vehicle.beacons;
        return await this.vehiclesRepository.createVehicleWithBeacons(vehicle, beacons);
    }

    public async getVehicles() {
        return await this.vehiclesRepository.getVehicles();
    }

    public async deleteVehicle(id: number, force = false): Promise<void> {
        if (force) {
            return await this.vehiclesRepository.hardDeleteVehicle(id);
        } else {
            return await this.vehiclesRepository.softDeleteVehicle(id);
        }
    }

    public async getVehicleByBeaconCallsign(callsign: string): Promise<Vehicle | undefined> {
        return await this.vehiclesRepository.getVehicleByBeaconCallsign(callsign);
    }

    public async isValidCallsign(callsign: string): Promise<boolean> {
        return !!(await this.vehiclesRepository.getVehicleByBeaconCallsign(callsign));
    }
}
