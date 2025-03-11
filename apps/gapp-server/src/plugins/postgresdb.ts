import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../db-types';
import { Pool } from 'pg';

interface PostgresdbPluginConfig extends FastifyPluginOptions {
    uri: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        postgresdb: Kysely<Database>;
    }
}

const postgresdbPlugin: FastifyPluginAsync<PostgresdbPluginConfig> = async (fastify, options) => {
    const pool = new Pool({ connectionString: options.uri });

    try {
        const client =await pool.connect();
        client.release();
        fastify.log.info('Connected to PostgreSQL');
    } catch (error) {
        fastify.log.error(error, 'Error connecting to PostgreSQL');
        process.exit(1);
    }

    const dialect = new PostgresDialect({ pool });
    const db = new Kysely<Database>({ dialect });

    fastify.decorate('postgresdb', db);
    fastify.addHook('onClose', async () => {
        await db.destroy();
    });
};

export default fp(postgresdbPlugin, { name: Plugins.POSTGRESDB });
