import type { VehicleCreate } from '@gapp/shared';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { stripBeacons } from '../utils/strip-beacons.ts';

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public createVehicle(vehicle: VehicleCreate) {
        return this.vehiclesRepository.createVehicleWithBeacons(stripBeacons(vehicle), vehicle.beacons);
    }

    public getVehicles() {
        return this.vehiclesRepository.getVehicles();
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
