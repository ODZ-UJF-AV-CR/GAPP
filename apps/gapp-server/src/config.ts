import { cleanEnv, num, str, url } from 'envalid';

const envSchema = {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    PORT: num({ default: 3000 }),

    INFLUXDB_TOKEN: str({ desc: 'Influx db token' }),
    INFLUXDB_HOST: url({
        desc: 'Influx db host with port',
        devDefault: 'http://localhost:8086',
    }),
    INFLUXDB_ORG: str({ desc: 'Influx db organization', default: 'fik' }),
};

export const getConfig = (configObject: object) => {
    return cleanEnv(configObject, envSchema);
};
