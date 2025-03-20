import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').addColumn('deleted_at', 'timestamp').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('vehicles').dropColumn('deleted_at').execute();
}
