// biome-ignore-all lint/suspicious/noExplicitAny: ok for kysely
import { type Kysely, sql } from 'kysely';
import { VehicleType } from '../types/enums.ts';

export async function up(db: Kysely<any>): Promise<void> {
    // 1. Create the new reference table
    await db.schema
        .createTable('vehicle_types')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(32)', (col) => col.notNull().unique())
        .addColumn('is_station', 'boolean', (col) => col.notNull().defaultTo(false))
        .execute();

    // 2. Insert initial reference data
    await db
        .insertInto('vehicle_types')
        .values([
            { name: 'balloon', is_station: false },
            { name: 'drone', is_station: false },
            { name: 'car', is_station: true },
        ])
        .execute();

    // 3. Add the new column as NULLABLE first
    await db.schema.alterTable('vehicles').addColumn('vehicle_type_id', 'bigint').execute();

    // 4. Migrate existing data: Update vehicle_type_id based on the 'type' enum
    await sql`
        UPDATE vehicles
        SET vehicle_type_id = (
            SELECT id FROM vehicle_types WHERE name = vehicles.type::text
        )
    `.execute(db);

    // 5. Enforce NOT NULL and Foreign Key constraints
    await db.schema
        .alterTable('vehicles')
        .alterColumn('vehicle_type_id', (col) => col.setNotNull())
        .execute();

    await db.schema
        .alterTable('vehicles')
        .addForeignKeyConstraint('vehicles_vehicle_type_id_fk', ['vehicle_type_id'], 'vehicle_types', ['id'])
        .onDelete('restrict')
        .execute();

    // 6. Cleanup: Drop the old column and enum type
    await db.schema.alterTable('vehicles').dropColumn('type').execute();
    await db.schema.dropType('vehicle_type').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    // 1. Re-create the Enum type
    await db.schema.createType('vehicle_type').asEnum(Object.values(VehicleType)).execute();

    // 2. Add the old column back (nullable first)
    await db.schema.alterTable('vehicles').addColumn('type', sql`"vehicle_type"`).execute();

    // 3. Restore data: Update 'type' based on 'vehicle_type_id'
    await sql`
        UPDATE vehicles
        SET type = (
            SELECT name FROM vehicle_types WHERE id = vehicles.vehicle_type_id
        )::vehicle_type
    `.execute(db);

    // 4. Enforce NOT NULL on the old column
    await db.schema
        .alterTable('vehicles')
        .alterColumn('type', (col) => col.setNotNull())
        .execute();

    // 5. Drop the new foreign key column
    await db.schema.alterTable('vehicles').dropColumn('vehicle_type_id').execute();

    // 6. Drop the new table
    await db.schema.dropTable('vehicle_types').execute();
}
