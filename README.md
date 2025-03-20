# GAPP

### ⚠️ WARNING - DEVELOPMENT IN PROGRESS ⚠️

> This repository is still under active development!
>
> -   The app is not stable yet
> -   Breaking changes may be introduced in future releases
> -   Data loss may occur during updates
> -   Please backup your data before updating

This is ground application for managing high altitude balloons flights. It forwards data to [amateur.sondehub.org](https://amateur.sondehub.org/).

## Run using docker compose

The easiest option to run GAPP is to use docker compose:

```yml
services:
    influxdb:
        image: influxdb:2
        container_name: gapp_influxdb2
        restart: unless-stopped
        ports:
            - 8086:8086
        volumes:
            - ./.example-data/influxdb:/var/lib/influxdb2:rw
        healthcheck:
            test: curl -f http://localhost:8086/ping
            interval: 10s
            timeout: 10s
            retries: 5
            start_period: 8s
        environment:
            - DOCKER_INFLUXDB_INIT_MODE=setup
            - DOCKER_INFLUXDB_INIT_USERNAME=user
            - DOCKER_INFLUXDB_INIT_PASSWORD=password
            - DOCKER_INFLUXDB_INIT_ORG=flight
            - DOCKER_INFLUXDB_INIT_BUCKET=telemetry
            - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=some-long-secret-like-string

    postgresdb:
        image: postgres:17.4-alpine
        container_name: gapp_postgresdb
        restart: unless-stopped
        ports:
            - 5434:5432
        volumes:
            - ./.example-data/postgres:/var/lib/postgresql/data:rw
        healthcheck:
            test: pg_isready -U user -d gapp
            interval: 10s
            timeout: 3s
            retries: 3
        environment:
            - POSTGRES_PASSWORD=password
            - POSTGRES_USER=postgres
            - POSTGRES_DB=gapp

    gapp:
        image: ghcr.io/odz-ujf-av-cr/gapp:latest
        container_name: gapp
        depends_on:
            influxdb:
                condition: service_healthy
            postgresdb:
                condition: service_healthy
        ports:
            - 3000:3000
        healthcheck:
            test: curl -f http://localhost:3000/api/ping
            interval: 10s
            timeout: 10s
            retries: 5
            start_period: 8s
        environment:
            - INFLUXDB_ORG=flight
            - INFLUXDB_TOKEN=some-long-secret-like-string
            - INFLUXDB_HOST=http://influxdb:8086
            - POSTGRESDB_URI=postgresql://postgres:password@postgresdb:5432/gapp
            - POSTGRESDB_URI=postgresql://postgres:password@localhost:5434/gapp
```

Or you can check out [compose.example.yml](./compose.example.yml)

> **NOTE**: If you can’t pull from ghcr.io, simply just run `docker logout ghcr.io`

## Local development

If you want to develop GAPP locally, check out [DEVELOPMENT.md](./DEVELOPMENT.md).
