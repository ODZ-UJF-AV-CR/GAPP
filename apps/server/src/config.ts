import { cleanEnv, num, str, url } from 'envalid';

const envSchema = {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    PORT: num({ default: 3000 }),

    DASHBOARD_STATIC_FILES: str({ desc: 'Path to static dashboard build (relative to main.ts)', default: '../../dashboard/' }),

    INFLUXDB_TOKEN: str({ desc: 'Influx db access token', devDefault: 'development-influx-token' }),
    INFLUXDB_HOST: url({
        desc: 'Influx database url',
        devDefault: 'http://localhost:8086',
    }),
    INFLUXDB_ORG: str({ desc: 'Influx db organization', default: 'flight' }),

    POSTGRESDB_URI: url({ desc: 'postgres database url', devDefault: 'postgresql://postgres:password@localhost:5434/gapp' }),
};

export const getConfig = (configObject: object) => {
    return cleanEnv(configObject, envSchema);
};
