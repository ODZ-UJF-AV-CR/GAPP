import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { promises as fs } from 'fs';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import * as path from 'path';
import { Pool } from 'pg';
import type { Database } from '../repository/postgres-database.ts';
import { Plugins } from './plugins.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PostgresdbPluginConfig extends FastifyPluginOptions {
    uri: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        postgresdb: Kysely<Database>;
    }
}

export const migrateToLatest = async (db: Kysely<Database>, fastify: FastifyInstance) => {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, '../migrations'),
        }),
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === 'Success') {
            fastify.log.info(`Migration "${it.migrationName}" was executed successfully.`);
        } else if (it.status === 'Error') {
            fastify.log.error(`Failed to execute migration "${it.migrationName}".`);
        }
    });

    if (error) {
        fastify.log.fatal(error, 'Failed to migrate database');
        process.exit(1);
    }
};

const postgresdbPlugin: FastifyPluginAsync<PostgresdbPluginConfig> = async (fastify, options) => {
    const pool = new Pool({ connectionString: options.uri });
    const dialect = new PostgresDialect({ pool });
    const db = new Kysely<Database>({ dialect });

    await migrateToLatest(db, fastify);
    fastify.log.info('Connected to PostgresDB');

    fastify.decorate('postgresdb', db);
    fastify.addHook('onClose', async () => {
        await db.destroy();
        fastify.log.info('Closed connection to PostgresDB');
    });
};

export default fp(postgresdbPlugin, { name: Plugins.POSTGRESDB });
