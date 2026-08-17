import type { VehicleCreate, VehicleUpdate } from '@gapp/shared';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { ConflictError, isUniqueViolation, NotFoundError } from '../utils/errors.ts';

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public async createVehicle(vehicle: VehicleCreate) {
        const vehicleType = await this.vehiclesRepository.getVehicleTypeById(vehicle.vehicle_type_id);

        if (!vehicleType) {
            throw new NotFoundError(`Vehicle type with id ${vehicle.vehicle_type_id} does not exist.`);
        }

        return await this.vehiclesRepository.createVehicleWithInitialBeacon(vehicle).catch((e) => {
            if (isUniqueViolation(e)) {
                throw new ConflictError(`Vehicle name ${vehicle.name} already exists.`);
            }
            throw e;
        });
    }

    public getVehicles(includeBeacons = false) {
        return this.vehiclesRepository.getVehicles(includeBeacons);
    }

    public async getVehicleById(id: number, includeBeacons = false) {
        const vehicle = await this.vehiclesRepository.getVehicleById(id, includeBeacons);

        if (!vehicle) {
            throw new NotFoundError(`Vehicle with id ${id} does not exist.`);
        }

        return vehicle;
    }

    public getVehicleTypes() {
        return this.vehiclesRepository.getVehicleTypes();
    }

    public async updateVehicle(id: number, vehicle: VehicleUpdate) {
        const updatedVehicle = await this.vehiclesRepository.updateVehicle(id, vehicle);

        if (!updatedVehicle) {
            throw new NotFoundError(`Vehicle with id ${id} does not exist.`);
        }

        return updatedVehicle;
    }

    public async deleteVehicle(id: number, force = false) {
        const deletedCount = force ? await this.vehiclesRepository.hardDeleteVehicle(id) : await this.vehiclesRepository.softDeleteVehicle(id);

        if (!deletedCount) {
            throw new NotFoundError(`Vehicle with id ${id} does not exist.`);
        }
    }

    public async restoreVehicle(id: number) {
        const restoredCount = await this.vehiclesRepository.restoreVehicle(id);

        if (!restoredCount) {
            throw new NotFoundError(`Deleted vehicle with id ${id} does not exist.`);
        }
    }

    public getVehicleByBeaconCallsign(callsign: string) {
        return this.vehiclesRepository.getVehicleByBeaconCallsign(callsign);
    }

    public async isValidCallsign(callsign: string): Promise<boolean> {
        return !!(await this.vehiclesRepository.getVehicleByBeaconCallsign(callsign));
    }
}
