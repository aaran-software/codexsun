FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV CXSUN_SERVER_HOST=0.0.0.0
ENV CXSUN_SERVER_PORT=4173
ENV CXSUN_WEB_ORIGIN=http://127.0.0.1:4173
ENV CXSUN_PUBLIC_DIR=/app/dist

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/cxsun/src ./cxsun/src
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/apps/cli/src ./apps/cli/src
COPY --from=builder /app/apps/sites/src ./apps/sites/src
COPY --from=builder /app/apps/sites/shared ./apps/sites/shared
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/dist ./dist

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4173/api/health >/dev/null || exit 1

CMD ["npm", "run", "start"]
