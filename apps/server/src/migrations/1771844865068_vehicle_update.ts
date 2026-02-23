// biome-ignore-all lint/suspicious/noExplicitAny: ok for kysely
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').renameColumn('callsign', 'name').execute();
    await db.schema.alterTable('vehicle_types').renameColumn('name', 'type_name').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').renameColumn('name', 'callsign').execute();
    await db.schema.alterTable('vehicle_types').renameColumn('type_name', 'name').execute();
}
