import type { BeaconsCreate } from '@gapp/shared';
import type { BeaconsRepository } from '../repository/beacons.repository.ts';
import type { VehiclesRepository } from '../repository/vehicles.repository.ts';
import { ConflictError, isUniqueViolation, NotFoundError } from '../utils/errors.ts';

export class BeaconService {
    constructor(
        private readonly beaconsRepository: BeaconsRepository,
        private readonly vehiclesRepository: VehiclesRepository,
    ) {}

    public async createBeacons(beacons: BeaconsCreate) {
        const callsigns = beacons.map((beacon) => beacon.callsign);
        const duplicates = callsigns.filter((callsign, index) => callsigns.indexOf(callsign) !== index);

        if (duplicates.length) {
            throw new ConflictError(`Duplicate callsigns in request: ${[...new Set(duplicates)].join(', ')}`);
        }

        const vehicleIds = [...new Set(beacons.map((beacon) => beacon.vehicle_id))];
        const vehicles = await this.vehiclesRepository.getVehiclesByIds(vehicleIds);
        const foundIds = new Set(vehicles.map((vehicle) => vehicle.id));
        const missingId = vehicleIds.find((id) => !foundIds.has(id));

        if (missingId !== undefined) {
            throw new NotFoundError(`Vehicle with id ${missingId} does not exist.`);
        }

        return await this.beaconsRepository.createBeacons(beacons).catch((e) => {
            if (isUniqueViolation(e)) {
                throw new ConflictError(`One of the callsigns already exists: ${callsigns.join(', ')}`);
            }
            throw e;
        });
    }

    public getBeacons(vehicleId?: number) {
        if (vehicleId === undefined) {
            return this.beaconsRepository.getBeacons();
        }

        return this.beaconsRepository.getBeaconsByVehicleId(vehicleId);
    }

    public async deleteBeacon(id: number) {
        const deletedCount = await this.beaconsRepository.deleteBeacon(id);

        if (!deletedCount) {
            throw new NotFoundError(`Beacon with id ${id} does not exist.`);
        }
    }
}
