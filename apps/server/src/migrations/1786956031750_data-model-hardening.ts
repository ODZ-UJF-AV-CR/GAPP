// biome-ignore-all lint/suspicious/noExplicitAny: ok for kysely
import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await sql`alter table vehicles alter column created_at type timestamptz using created_at at time zone 'UTC'`.execute(db);
    await sql`alter table vehicles alter column deleted_at type timestamptz using deleted_at at time zone 'UTC'`.execute(db);

    // the constraint kept its pre-rename name on existing databases, so both are dropped defensively
    await sql`alter table vehicles drop constraint if exists vehicles_callsign_key`.execute(db);
    await sql`alter table vehicles drop constraint if exists vehicles_name_key`.execute(db);

    // soft deleted vehicles must not reserve their name forever
    await sql`create unique index vehicles_name_active_key on vehicles (name) where deleted_at is null`.execute(db);

    await sql`create index vehicles_active_idx on vehicles (id) where deleted_at is null`.execute(db);
    await db.schema.createIndex('vehicles_vehicle_type_id_idx').on('vehicles').column('vehicle_type_id').execute();
    await db.schema.createIndex('beacons_vehicle_id_idx').on('beacons').column('vehicle_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex('beacons_vehicle_id_idx').execute();
    await db.schema.dropIndex('vehicles_vehicle_type_id_idx').execute();
    await db.schema.dropIndex('vehicles_active_idx').execute();
    await db.schema.dropIndex('vehicles_name_active_key').execute();

    await sql`alter table vehicles add constraint vehicles_name_key unique (name)`.execute(db);

    await sql`alter table vehicles alter column deleted_at type timestamp`.execute(db);
    await sql`alter table vehicles alter column created_at type timestamp`.execute(db);
}
