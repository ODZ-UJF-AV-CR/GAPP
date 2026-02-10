import { type Kysely, sql } from 'kysely';
import { VehicleType } from '../types/enums.ts';

export async function up(db: Kysely<any>) {
    await db.schema.createType('vehicle_type').asEnum(Object.values(VehicleType)).execute();

    await db.schema
        .createTable('vehicles')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('type', sql`"vehicle_type"`, (col) => col.notNull())
        .addColumn('callsign', 'varchar(32)', (col) => col.notNull().unique())
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createTable('beacons')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('callsign', 'varchar(32)', (col) => col.notNull().unique())
        .addColumn('vehicle_id', 'bigint', (col) => col.notNull().references('vehicles.id').onDelete('cascade'))
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable('beacons').execute();
    await db.schema.dropTable('vehicles').execute();
    await db.schema.dropType('vehicle_type').execute();
}
