# Codexsun Roadmap

## Near-Term Platform Work

- Establish a reusable Common Master Data module in `cxserver` for location, product, order, transport, and shared operational masters so future product, vendor, logistics, and address workflows can consume the same datasets.
- Standardize frontend admin list screens with a full reusable list skeleton covering header, filters, table, footer, and pagination so future master-data and operational pages ship with consistent UX by default.
- Add a reusable frontend common-master management pattern with shared list and modal upsert flows so future master pages plug into a consistent admin interaction model.
- Extend shared popup autocomplete creation to dependent location fields beyond the currently wired country and city->district flows, only where enough parent context exists for valid server-side creates.
- Expand the current product pricing model so a single catalog item can serve retail, wholesale, vendor-channel, and date-bounded offer pricing without forking the product or variant tables.
- Introduce a vendor-company layer above vendor users so future storefront, warehouse ownership, tax onboarding, and multi-staff vendor operations can target a business entity instead of only individual Auth users.
- Connect vendor companies to warehouse ownership and enforce vendor-company scoped access across inventory, contacts, and operational vendor workflows.

## Near Term

- Establish baseline local infrastructure with Dockerized PostgreSQL and Redis.
- Align Aspire orchestration, API, and frontend with standardized local ports.
- Add automated database connectivity validation to protect local setup changes.
- Establish the platform security baseline with modular identity, JWT authentication, refresh-token rotation, and policy-based authorization.
- Integrate the frontend app shell with backend identity for persistent sessions, protected routing, and role-aware navigation.
- Add admin-facing user, role, and permission management workflows on top of the identity foundation.

- Enterprise operations phase: activate AfterSales and add Analytics, Promotions, and Shipping modules on top of the current modular monolith without changing module boundaries.

- Platform communications phase: add centralized Notifications module with multi-channel templates, queue processing, and domain-event integrations.
- Platform asset-management phase: add centralized Media/File Manager module with local storage, thumbnails, usage tracking, and reusable picker workflows for products, vendors, and future CMS content.
