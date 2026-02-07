# This is guide to local development of GAPP

## Preparations

1. You need to use NodeJS version `v24.5.0` or newer or use `nvm use` to switch to the correct version.

2. Since we are using [PNPM](https://pnpm.io/), you need to install corepack:

```bash
npm install -g corepack0.32.0

corepack enable
```

3. Install dependencies by running `pnpm install`

4. Run dependencies by `docker compose up -d`.

5. To develop dashboard, run `pnpm run dashboard:dev`

6. To develop server, run `pnpm run server:dev`

## API Documentation

Swagger is available at [http://localhost:3000/docs](http://localhost:3000/docs).

## Influx dashboard

You can login to Influx dahboard on [http://localhost:8086](http://localhost:8086) with credentials:

- user: `user`
- password: `password`
