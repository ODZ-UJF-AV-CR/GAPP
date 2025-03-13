import { NewBeacon, NewVehicle } from "../repository/database";
import { VehiclesRepository } from "../repository/vehicles.repository";

export class VehicleService {
    constructor(private readonly vehiclesRepository: VehiclesRepository) {}

    public async createVehicle(vehicle: NewVehicle, beacons: NewBeacon[]) {
        const createdVehicle = await this.vehiclesRepository.createVehicle(vehicle);

        const beaconsWithVehicleId = beacons.map((b) => ({...b, vehicle_id: createdVehicle.id }));

        await this.vehiclesRepository.createBeacons(beaconsWithVehicleId);
    }

    public async isValidCallsign(callsign: string): Promise<boolean> {
        const beacon = await this.vehiclesRepository.getBeaconByCallsign(callsign);

        return !!beacon;
    }
}
