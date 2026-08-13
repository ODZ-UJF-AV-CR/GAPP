import type { VehicleCreate } from '@gapp/shared';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public createVehicle(vehicle: VehicleCreate) {
        return this.vehiclesRepository.createVehicle(vehicle);
    }

    public getVehicles(includeBeacons = false) {
        return this.vehiclesRepository.getVehicles(includeBeacons);
    }

    public getVehicleTypes() {
        return this.vehiclesRepository.getVehicleTypes();
    }

    public deleteVehicle(id: number, force = false): Promise<void> {
        if (force) {
            return this.vehiclesRepository.hardDeleteVehicle(id);
        } else {
            return this.vehiclesRepository.softDeleteVehicle(id);
        }
    }

    public getVehicleByBeaconCallsign(callsign: string) {
        return this.vehiclesRepository.getVehicleByBeaconCallsign(callsign);
    }

    public async isValidCallsign(callsign: string): Promise<boolean> {
        return !!(await this.vehiclesRepository.getVehicleByBeaconCallsign(callsign));
    }
}
