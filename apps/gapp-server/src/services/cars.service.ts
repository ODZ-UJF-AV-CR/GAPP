import { Collection, Db, ObjectId } from 'mongodb';
import { ensureCollection } from '../utils/ensure-collection';

export interface Car {
    callsign: string;
    description?: string;
}

export class CarsService {
    private carsCollection: Collection<Car>;

    constructor(private db: Db) {}

    public async init() {
        this.carsCollection = await ensureCollection(this.db, 'cars');
    }

    public async addCar(car: Car) {
        const existingCar = await this.carsCollection.findOne({
            callsign: car.callsign,
        });

        if (existingCar) {
            throw new Error('Car with this callsign already exists');
        }

        return this.carsCollection.insertOne(car);
    }

    public async getCars() {
        return (await this.carsCollection.find().toArray()).map((car) => ({
            ...car,
            _id: car._id.toString(),
        }));
    }

    public async deleteCar(id: string) {
        return await this.carsCollection.deleteOne({ _id: new ObjectId(id) });
    }

    public async ensureCallsign(callsign: string): Promise<boolean> {
        return !!(await this.carsCollection.findOne({ callsign }));
    }
}
