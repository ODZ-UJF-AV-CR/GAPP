import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>) {
    await db.schema
        .createTable('vehicle_types')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'text', (col) => col.notNull().unique())
        .execute();

    await db.schema
        .createTable('vehicles')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('callsign', 'varchar(32)', (col) => col.notNull().unique())
        .addColumn('type', 'bigint', (col) => col.notNull().references('vehicle_types.id').onDelete('cascade'))
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createTable('beacons')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('callsign', 'varchar(32)', (col) => col.notNull().unique())
        .addColumn('vehicle_id', 'bigint', (col) => col.notNull().references('vehicles.id').onDelete('cascade'))
        .execute();
}

export async function down(db: Kysely<unknown>) {
    await db.schema.dropTable('beacons').execute();
    await db.schema.dropTable('vehicles').execute();
    await db.schema.dropTable('vehicle_types').execute();
}
