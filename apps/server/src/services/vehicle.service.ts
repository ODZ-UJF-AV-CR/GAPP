import type { VehicleCreate, VehicleUpdate } from '@gapp/shared';
import type { BeaconsRepository } from '../repository/beacons.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { ConflictError, NotFoundError } from '../utils/errors.ts';

const MAX_CALLSIGN_SUFFIX = 100;

export class VehicleService {
    constructor(
        private readonly vehiclesRepository: VehiclesRepository,
        private readonly beaconsRepository: BeaconsRepository,
    ) {}

    public async createVehicle(vehicle: VehicleCreate) {
        const vehicleType = await this.vehiclesRepository.getVehicleTypeById(vehicle.vehicle_type_id);

        if (!vehicleType) {
            throw new NotFoundError(`Vehicle type with id ${vehicle.vehicle_type_id} does not exist.`);
        }

        const createdVehicle = await this.vehiclesRepository.createVehicle(vehicle);
        const callsign = await this.resolveBeaconCallsign(createdVehicle.name);
        const beacons = await this.beaconsRepository.createBeacons([{ callsign, vehicle_id: createdVehicle.id }]);

        return { ...createdVehicle, beacons };
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

    /** @description Finds a free callsign for the initial vehicle beacon, appending an incrementing suffix when taken */
    private async resolveBeaconCallsign(name: string) {
        for (let suffix = 0; suffix <= MAX_CALLSIGN_SUFFIX; suffix++) {
            const callsign = suffix === 0 ? name : `${name}_${suffix}`;
            const beacon = await this.beaconsRepository.getBeaconByCallsign(callsign);

            if (!beacon) {
                return callsign;
            }
        }

        throw new ConflictError(`Could not find a free beacon callsign for station ${name}.`);
    }
}
