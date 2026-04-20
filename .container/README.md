# Container Deployment

This folder holds the deployment helpers for the single-space container runtime.

Primary files:

- `Dockerfile`
- `bash/setup.sh`
- `bash/clean.sh`
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

Local deployment:

```bash
./.container/clients/codexsun/setup.sh
```

The image tag is `codexsun:v2`.

Npm aliases:

```bash
npm run docker:setup
npm run docker:clean
```

Local docker e2e validation:

```bash
npm run test:e2e:docker
```

Read `USAGE.md` and `clients/codexsun/USAGE.md` for build, start, clean, and database network details.
