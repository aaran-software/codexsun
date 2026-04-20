# Container Deployment

This folder holds the deployment helpers for the single-space container runtime.

Primary files:

- `Dockerfile`
- `bash/setup.sh`
- `bash/clean.sh`
- `bash/update.sh`
- `clients/codexsun/docker-compose.yml`
- `clients/codexsun/setup.sh`
- `clients/codexsun/USAGE.md`
- `USAGE.md`

Rules:

- deploy one application container only
- do not use runtime bind mounts or source volumes
- let CI/CD rebuild and publish new images from GitHub pushes
- keep local docker deployment aligned with the same image shape used for publish
- run the app on the external `codexion` Docker network so it can reach an existing MariaDB container
- treat Docker setup as one-time infrastructure; deploy updates from the host checkout with Git sync and compose rebuild

Local deployment:

```bash
./.container/clients/codexsun/setup.sh
```

The image tag is `codexsun:v2`.

Npm aliases:

```bash
npm run docker:setup
npm run docker:clean
npm run deploy:status
npm run deploy:update
```

Manual production update:

```bash
npm run deploy:update
```

This command reads `.env`, fetches `GIT_BRANCH` from `GIT_REPOSITORY_URL`,
resets tracked files to `origin/<branch>`, runs `git clean -fd`, and rebuilds
the app with compose. It preserves ignored `.env`, Docker volumes, the external
`codexion` network, and the database container.

Local docker e2e validation:

```bash
npm run test:e2e:docker
```

Read `USAGE.md` and `clients/codexsun/USAGE.md` for build, start, clean, and database network details.
