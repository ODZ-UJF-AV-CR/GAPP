// biome-ignore-all lint/suspicious/noExplicitAny: ok for kysely
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('vehicles')
        .addColumn('upload_aggregation', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('upload_beacons', 'boolean', (col) => col.notNull().defaultTo(false))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').dropColumn('upload_aggregation').dropColumn('upload_beacons').execute();
}
