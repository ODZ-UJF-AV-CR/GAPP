import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .insertInto('vehicle_types')
        .values([{ name: 'car' }, { name: 'drone' }, { name: 'balloon' }])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.deleteFrom('vehicle_types').where('name', '=', 'car').execute();
    await db.deleteFrom('vehicle_types').where('name', '=', 'drone').execute();
    await db.deleteFrom('vehicle_types').where('name', '=', 'balloon').execute();
}
