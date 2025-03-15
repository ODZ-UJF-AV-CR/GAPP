# GAPP

### ⚠️ WARNING - DEVELOPMENT IN PROGRESS ⚠️
> **CAUTION**: This repository is still under active development!
> - The app is not stable yet
> - Breaking changes may be introduced in future releases
> - Data loss may occur during updates
> - Please backup your data before updating


This is ground application for managing high altitude balloons flights. It works with [amateur.sondehub.org](https://amateur.sondehub.org/).


## Run using docker compose

The easiest option to run GAPP is to use docker compose:

```yml
version: '3.8'

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

    mongodb:
        image: mongo:8
        container_name: gapp_mongodb
        restart: unless-stopped
        volumes:
            - ./.example-data/mongodb:/data/db:rw
        healthcheck:
            test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
            interval: 10s
            timeout: 10s
            retries: 5
            start_period: 8s
        environment:
            - MONGO_INITDB_ROOT_USERNAME=user
            - MONGO_INITDB_ROOT_PASSWORD=password
            - MONGO_INITDB_DATABASE=gapp

    gapp:
        image: ghcr.io/odz-ujf-av-cr/gapp:latest
        container_name: gapp
        depends_on:
            influxdb:
                condition: service_healthy
            mongodb:
                condition: service_healthy
        ports:
            - 3000:3000
        environment:
            - INFLUXDB_ORG=flight
            - INFLUXDB_TOKEN=some-long-secret-like-string
            - INFLUXDB_HOST=http://influxdb:8086
            - MONGODB_URI=mongodb://user:password@mongodb:27017/
```

Or you can check out [compose.example.yml](./compose.example.yml)

> **NOTE**: If you can’t pull from ghcr.io, simply just run `docker logout ghcr.io`

## Local development

If you want to develop GAPP locally, check out [DEVELOPMENT.md](./DEVELOPMENT.md).
