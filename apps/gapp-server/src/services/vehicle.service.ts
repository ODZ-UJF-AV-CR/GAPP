import { NewBeacon, NewVehicle, Vehicle } from '../repository/postgres-database';
import { VehiclesRepository } from '../repository/vehicles.repository';

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public async createVehicle(data: { vehicle: NewVehicle; beacons: NewBeacon[] }) {
        return await this.vehiclesRepository.createVehicleWithBeacons(data.vehicle, data.beacons);
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
