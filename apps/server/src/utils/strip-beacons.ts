import type { VehicleCreate } from '@gapp/shared';
import type { NewVehicle } from '../repository/postgres-database.ts';

export const stripBeacons = (vehicle: VehicleCreate): NewVehicle => {
    const { beacons, ...rest } = vehicle;

    return { ...rest };
};
