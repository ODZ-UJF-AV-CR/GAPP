// biome-ignore-all lint/suspicious/noExplicitAny: ok for kysely
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').addColumn('description', 'text').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').dropColumn('description').execute();
}
