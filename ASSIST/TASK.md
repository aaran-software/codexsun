# Current Task

## Prompt

Refactor the Common master database naming convention so all `common_*` tables are renamed to direct snake_case entity table names without the `common_` prefix.

## Objective

Update the Common module EF mappings, migration history, and documentation so the database uses concise table names like `cities`, `brands`, and `contact_types` while keeping the existing Common APIs unchanged.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Do not change Common entity class names or API routes.
- Preserve foreign keys, indexes, seed data behavior, and existing endpoint functionality.
- Use a dedicated EF Core migration named `RenameCommonTables` to rename existing tables cleanly.

## Observed Repository State

- The Common table names are defined in `cxserver/Modules/Common/Configurations` and currently use `common_*` prefixes.
- The generated `CommonMasterData` migration and EF snapshot also embed the old `common_*` table names.
- There are no other backend hardcoded table-name usages outside the Common EF metadata and related documentation.

## Plan

1. Capture the prompt and update task tracking for the Common table naming cleanup.
2. Rename the Common EF table mappings, generate and verify the `RenameCommonTables` migration, and ensure snapshots/imports/build remain healthy.
3. Revalidate build/tests/database state, then update the database documentation and project log with the new naming convention.
