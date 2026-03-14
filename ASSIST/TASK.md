# Current Task

## Prompt

Expand the current seed data cleanly for Auth and Common so a fresh database contains practical default masters, major India/Tamil Nadu location data, and multiple seeded users mapped to the existing role model.

## Objective

Refactor the seed definitions into cleaner reusable seed data sources, add richer default records for the existing Common masters, preserve `sundar@sundar.com` as the super admin, add three additional seeded users for storefront, back office, and management, then recreate the database from scratch and validate the result.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Do not break the current production baseline schema or the working GUID-based Auth module.
- Keep backend, frontend, and documentation changes consistent with the real migration history in the repository.
- Use the existing `Common` backend module and current `CommonList` / `CommonUpsertDialog` frontend building blocks rather than introducing a conflicting parallel structure.
- Do not modify the consolidated `ProductionBaseline`; use an incremental migration for the seed refresh.
- Keep `"-"` as the default first seed row for name/code-based unknown master values where the schema allows it.

## Observed Repository State

- The active migration in `cxserver/Migrations` is `20260314133756_ProductionBaseline`, not `DatabaseStructureAuthToVendor`.
- The backend currently exposes `Auth`, `Common`, `Finance`, and `System` modules; separate `Location`, `Product`, `Contact`, and `Vendor` modules do not yet exist.
- The frontend already uses `CommonList` and `CommonUpsertDialog`, while the prompt still references the older `ListCommon` naming.
- The current schema does not include the full Prompt 013 target set for `user_roles`, `contacts`, `contact_addresses`, `companies`, `vendors`, `vendor_users`, `vendor_addresses`, or `product_categories`.
- The backend Common controllers already cover the real reusable masters that exist now: location, catalog, and operations masters.
- Auth seeding is currently embedded inline in `CodexsunDbContext.OnModelCreating`.
- Common master seed data is currently embedded directly inside the Common configuration classes with only minimal default records.

## Plan

1. Capture the prompt and move Auth/Common seed values into cleaner reusable seed definitions.
2. Expand the current seed dataset for countries, Indian states, Tamil Nadu districts, major cities, known pincodes, contact types, sizes, colours, HSN codes, and related common masters.
3. Seed additional users for management, back office, and storefront using the existing role model and keep `sundar@sundar.com` as the super admin.
4. Generate an incremental migration, drop and recreate the database, then run builds/tests and update documentation.
