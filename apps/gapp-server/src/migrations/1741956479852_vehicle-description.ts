import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema.alterTable('vehicles').addColumn('description', 'text').execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.alterTable('vehicles').dropColumn('description').execute();
}
