import { describe, expect, it, vi } from 'vitest';
import { ConflictError, NotFoundError } from '../utils/errors.ts';
import { VehicleService } from './vehicle.service.ts';

const UNIQUE_VIOLATION = Object.assign(new Error('duplicate key'), { code: '23505' });

const createService = (overrides: Record<string, unknown> = {}) => {
    const vehiclesRepository = {
        getVehicleTypeById: vi.fn(async () => ({ id: 1, type_name: 'balloon', is_station: false })),
        createVehicleWithInitialBeacon: vi.fn(async (vehicle: { name: string }) => ({ id: 1, ...vehicle, beacons: [] })),
        getVehicleById: vi.fn(async () => ({ id: 1, name: 'balloon' })),
        updateVehicle: vi.fn(async () => ({ id: 1, name: 'balloon' })),
        softDeleteVehicle: vi.fn(async () => 1),
        hardDeleteVehicle: vi.fn(async () => 1),
        restoreVehicle: vi.fn(async () => 1),
        ...overrides,
    };

    return { service: new VehicleService(vehiclesRepository as never), vehiclesRepository };
};

describe('VehicleService', () => {
    describe('createVehicle', () => {
        it('rejects an unknown vehicle type', async () => {
            const { service } = createService({ getVehicleTypeById: vi.fn(async () => undefined) });

            await expect(service.createVehicle({ name: 'balloon', vehicle_type_id: 99 })).rejects.toBeInstanceOf(NotFoundError);
        });

        it('creates the vehicle together with its beacon', async () => {
            const { service, vehiclesRepository } = createService();

            await service.createVehicle({ name: 'balloon', vehicle_type_id: 1 });

            expect(vehiclesRepository.createVehicleWithInitialBeacon).toHaveBeenCalledTimes(1);
        });

        it('translates a duplicate name into a conflict', async () => {
            const { service } = createService({
                createVehicleWithInitialBeacon: vi.fn(async () => {
                    throw UNIQUE_VIOLATION;
                }),
            });

            await expect(service.createVehicle({ name: 'balloon', vehicle_type_id: 1 })).rejects.toThrow(/already exists/);
        });

        it('does not swallow unrelated database errors', async () => {
            const { service } = createService({
                createVehicleWithInitialBeacon: vi.fn(async () => {
                    throw new Error('connection lost');
                }),
            });

            await expect(service.createVehicle({ name: 'balloon', vehicle_type_id: 1 })).rejects.toThrow('connection lost');
        });
    });

    describe('updateVehicle', () => {
        it('reports a missing or deleted vehicle as not found', async () => {
            const { service } = createService({ updateVehicle: vi.fn(async () => undefined) });

            await expect(service.updateVehicle(1, { description: 'x' })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteVehicle', () => {
        it('soft deletes by default', async () => {
            const { service, vehiclesRepository } = createService();

            await service.deleteVehicle(1);

            expect(vehiclesRepository.softDeleteVehicle).toHaveBeenCalledTimes(1);
            expect(vehiclesRepository.hardDeleteVehicle).not.toHaveBeenCalled();
        });

        it('hard deletes when forced', async () => {
            const { service, vehiclesRepository } = createService();

            await service.deleteVehicle(1, true);

            expect(vehiclesRepository.hardDeleteVehicle).toHaveBeenCalledTimes(1);
            expect(vehiclesRepository.softDeleteVehicle).not.toHaveBeenCalled();
        });

        it('reports a missing vehicle as not found instead of succeeding silently', async () => {
            const { service } = createService({ softDeleteVehicle: vi.fn(async () => 0) });

            await expect(service.deleteVehicle(1)).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('restoreVehicle', () => {
        it('restores a deleted vehicle', async () => {
            const { service, vehiclesRepository } = createService();

            await service.restoreVehicle(1);

            expect(vehiclesRepository.restoreVehicle).toHaveBeenCalledWith(1);
        });

        it('reports an unknown vehicle as not found', async () => {
            const { service } = createService({ getVehicleById: vi.fn(async () => undefined) });

            await expect(service.restoreVehicle(1)).rejects.toBeInstanceOf(NotFoundError);
        });

        it('reports an active vehicle as a conflict', async () => {
            const { service } = createService({ restoreVehicle: vi.fn(async () => 0) });

            await expect(service.restoreVehicle(1)).rejects.toBeInstanceOf(ConflictError);
        });

        it('reports a name taken by another active vehicle as a conflict', async () => {
            const { service } = createService({
                restoreVehicle: vi.fn(async () => {
                    throw UNIQUE_VIOLATION;
                }),
            });

            await expect(service.restoreVehicle(1)).rejects.toThrow(/already used by an active vehicle/);
        });
    });
});
