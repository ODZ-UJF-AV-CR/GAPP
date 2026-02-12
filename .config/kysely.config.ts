import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

export default defineConfig({
    dialect: 'pg',
    dialectConfig: {
        pool: new Pool({ connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5434/gapp' }),
    },
    migrations: {
        migrationFolder: 'apps/server/src/migrations',
    },
    plugins: [],
});
