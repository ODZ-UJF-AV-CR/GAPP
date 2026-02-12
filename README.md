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

The easiest option to run GAPP is to use docker compose.

1. Download the example compose file ([compose.example.yml](./compose.example.yml)):

```bash
curl -o compose.yml https://raw.githubusercontent.com/ODZ-UJF-AV-CR/GAPP/refs/heads/main/compose.example.yml
```

2. Run the application:

```bash
docker compose up -d
```

> **⚠️IMPORTANT⚠️**: For production use, it is highly recommended to update the environment variables (passwords, tokens, etc.) in the `docker-compose.yml` file.
>
> **NOTE**: If you can’t pull from ghcr.io, simply just run `docker logout ghcr.io`

## Local development

If you want to develop GAPP locally, check out [CONTRIBUTING.md](./CONTRIBUTING.md).
