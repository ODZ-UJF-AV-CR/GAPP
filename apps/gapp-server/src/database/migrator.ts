import * as path from 'path';
import { promises as fs } from 'fs';
import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { Database } from './db-types';
import { FastifyInstance } from 'fastify';

export const migrateToLatest = async (db: Kysely<Database>, fastify: FastifyInstance) => {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, './migrations'),
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
