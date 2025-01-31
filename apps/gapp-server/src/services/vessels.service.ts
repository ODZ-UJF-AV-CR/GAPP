import { Collection, Db, ObjectId } from 'mongodb';

export enum VesselType {
    BALLOON = 'balloon',
    UAV = 'uav',
}

export interface Vessel {
    callsign: string;
    transmitters: string[];
    type: VesselType;
    description?: string;
}

export class VesselsService {
    private vesselsCollection: Collection<Vessel>;

    constructor(private db: Db) {}

    public async init() {
        const collections = await this.db.listCollections({ name: 'vessels' }).toArray();

        if (!collections) {
            this.vesselsCollection = await this.db.createCollection('vessels');

            await this.vesselsCollection.createIndex({ callsign: 1 }, { unique: true });
        } else {
            this.vesselsCollection = this.db.collection<Vessel>('vessels');
        }
    }

    public async addVessel(vessel: Vessel) {
        const existingCallsign = await this.vesselsCollection.findOne({
            callsign: vessel.callsign,
        });

        if (existingCallsign) {
            throw new Error('Vessel with this callsign already exists');
        }
        const vesselWithtransmitter = await this.vesselsCollection.findOne({
            transmitters: {
                $in: vessel.transmitters,
            },
        });

        if (vesselWithtransmitter) {
            throw new Error(`Transmitters already exists on ${vesselWithtransmitter.callsign} vessel`);
        }

        return this.vesselsCollection.insertOne(vessel);
    }

    public async getVessels() {
        return (await this.vesselsCollection.find().toArray()).map((vessel) => ({
            ...vessel,
            _id: vessel._id.toString(),
        }));
    }

    public async deleteVessel(id: string) {
        return await this.vesselsCollection.deleteOne({ _id: new ObjectId(id) });
    }

    public async ensureCallsign(callsign: string): Promise<boolean> {
        return !!(await this.vesselsCollection.findOne({ transmitters: callsign }));
    }
}
