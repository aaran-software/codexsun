# Codexsun Demo Container Setup

Run every command from the repo root.

## One-command Setup

```bash
./.container/clients/codexsun/setup.sh
```

This builds `codexsun:v2`, starts the `codexsun` container, attaches it to the external `codexion` network, and waits for `http://127.0.0.1:4173/api/health`.

## Cloud-style Setup

```bash
TARGET_ENV=cloud CODEXSUN_DOMAIN=codexsun.com ./.container/clients/codexsun/setup.sh
```

Cloud mode binds the app to `127.0.0.1:4173` for a reverse proxy.

## Existing MariaDB

The app is attached to `codexion` and expects MariaDB to be reachable as `mariadb` unless overridden.

```bash
CODEXSUN_DB_HOST=mariadb CODEXSUN_DB_NAME=codexsun CODEXSUN_DB_USER=root CODEXSUN_DB_PASSWORD='secret' ./.container/clients/codexsun/setup.sh
```

The current app does not create or drop databases during cleanup. The variables are passed through for deployment compatibility.

## Clean App Container And Image Only

```bash
./.container/bash/clean.sh
```

This removes only the Codexsun app container and `codexsun:v2`. It does not remove Docker networks, volumes, or database containers.
