import { cleanEnv, num, str, url } from 'envalid';

const envSchema = {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    PORT: num({ default: 3000 }),

    INFLUXDB_TOKEN: str({ desc: 'Influx db token', devDefault: 'development-influx-token' }),
    INFLUXDB_HOST: url({
        desc: 'Influx db host with port',
        devDefault: 'http://localhost:8086',
    }),
    INFLUXDB_ORG: str({ desc: 'Influx db organization', default: 'flight' }),

    POSTGRESDB_URI: url({ desc: 'Postgres db uri', devDefault: 'postgresql://postgres:password@localhost:5434/gapp' }),
};

export const getConfig = (configObject: object) => {
    return cleanEnv(configObject, envSchema);
};
