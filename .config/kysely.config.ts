import { DummyDriver, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

export default defineConfig({
    dialect: 'pg',
    dialectConfig: {
        pool: new Pool({ connectionString: process.env.POSTGRESDB_URI || 'postgresql://postgres:password@localhost:5434/gapp' }),
    },
    migrations: {
        migrationFolder: 'apps/gapp-server/src/database/migrations',
    },
    plugins: [],
});
