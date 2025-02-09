import { Collection, Db } from 'mongodb';

export const ensureCollection = async <T>(db: Db, name: string): Promise<Collection<T>> => {
    let collection: Collection<T>;
    const collections = await db.listCollections({ name }).toArray();

    if (!collections) {
        collection = await db.createCollection(name);
    } else {
        collection = db.collection<T>(name);
    }

    return collection;
};
