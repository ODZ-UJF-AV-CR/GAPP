import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { Db, MongoClient } from 'mongodb';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';

interface MongodbPluginConfig extends FastifyPluginOptions {
    uri: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        mongodb: Db;
    }
}

const mongodbPlugin: FastifyPluginAsync<MongodbPluginConfig> = async (fastify, options) => {
    const client = new MongoClient(options.uri, {
        maxPoolSize: 20,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5_000,
    });

    try {
        await client.connect();
        fastify.log.info('Connected to MongoDB');

        fastify.addHook('onClose', async () => {
            await client.close();
            fastify.log.info('Closed connection to MongoDB');
        });

        fastify.decorate('mongodb', client.db('gapp'));
    } catch (err) {
        fastify.log.fatal(err, 'Failed to connect to MongoDB');
    }
};

export default fp(mongodbPlugin, { name: Plugins.MONGODB });
