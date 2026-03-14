# Codexsun Roadmap

## Near-Term Platform Work

- Establish a reusable Common Master Data module in `cxserver` for location, product, order, transport, and shared operational masters so future product, vendor, logistics, and address workflows can consume the same datasets.
- Standardize frontend admin list screens with a full reusable list skeleton covering header, filters, table, footer, and pagination so future master-data and operational pages ship with consistent UX by default.

## Near Term

- Establish baseline local infrastructure with Dockerized PostgreSQL and Redis.
- Align Aspire orchestration, API, and frontend with standardized local ports.
- Add automated database connectivity validation to protect local setup changes.
- Establish the platform security baseline with modular identity, JWT authentication, refresh-token rotation, and policy-based authorization.
- Integrate the frontend app shell with backend identity for persistent sessions, protected routing, and role-aware navigation.
- Add admin-facing user, role, and permission management workflows on top of the identity foundation.
