import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Plugins } from './plugins';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../database/db-types';
import { Pool } from 'pg';
import { migrateToLatest } from '../database/migrator';

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
    const dialect = new PostgresDialect({ pool });
    const db = new Kysely<Database>({ dialect });

    await migrateToLatest(db, fastify);

    fastify.decorate('postgresdb', db);
    fastify.addHook('onClose', async () => {
        await db.destroy();
    });
};

export default fp(postgresdbPlugin, { name: Plugins.POSTGRESDB });
