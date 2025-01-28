import { Collection, Db } from 'mongodb';

export interface Car {
    callsign: string;
    description?: string;
}

export class CarsService {
    private carsCollection: Collection<Car>;

    constructor(private db: Db) {}

    public async init() {
        const collections = await this.db.listCollections({ name: 'cars' }).toArray();

        if (!collections) {
            this.carsCollection = await this.db.createCollection('cars');

            await this.carsCollection.createIndex({ callsign: 1 }, { unique: true });
        } else {
            this.carsCollection = this.db.collection<Car>('cars');
        }
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

    public async ensureCallsign(callsign: string): Promise<boolean> {
      return !!(await this.carsCollection.findOne({ callsign }));
    }
}
