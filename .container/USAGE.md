# Container Usage

Run commands from the repo root.

## One-command Setup

```bash
./.container/clients/codexsun/setup.sh
```

This creates the external Docker network `codexion` if it is missing, builds `codexsun:v2`, starts the Codexsun demo client with Compose, and waits for `/api/health`.

The npm alias is:

```bash
npm run docker:setup
```

Shared setup remains under `bash`:

```bash
CLIENTS=codexsun ./.container/bash/setup.sh
```

## Build

```bash
docker compose -f .container/clients/codexsun/docker-compose.yml build
```

The compose file builds from repo root using `.container/Dockerfile` and tags the image as `codexsun:v2`.

## Start

```bash
docker compose -f .container/clients/codexsun/docker-compose.yml up -d
```

The app binds to host port `4173` by default. Override with `CXSUN_HOST_PORT=8080`.

## Clean

```bash
./.container/bash/clean.sh
```

Cleanup removes only selected app containers and `codexsun:v2`. It never removes Docker networks, volumes, MariaDB containers, or databases.

## Existing MariaDB

The app joins the external Docker network `codexion` and expects MariaDB to be reachable as `mariadb` by default.

Override database connection values as needed:

```bash
CODEXSUN_DB_HOST=mariadb CODEXSUN_DB_PORT=3306 CODEXSUN_DB_NAME=codexsun CODEXSUN_DB_USER=root CODEXSUN_DB_PASSWORD='secret' ./.container/clients/codexsun/setup.sh
```
