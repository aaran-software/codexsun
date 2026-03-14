# Current Task

## Prompt

Consolidate the backend migrations into a single clean `BaselineSchema` migration, reorganize the schema by module, and add default `"-"` seed data across all common tables.

## Objective

Assess whether the current Codexsun backend and database can be safely reset into one baseline migration, then implement the baseline only for the schema that actually exists in code without inventing undocumented domains.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Do not invent missing ERP domains that are not implemented in the repository without explicit approval.
- Verify the actual PostgreSQL tables and current EF model before deleting or regenerating migrations.
- Keep the application buildable and the live development database recoverable.

## Observed Repository State

- `CodexsunDbContext` currently models only `Auth` and `Common` entities.
- The prompt references many additional domains and tables such as `address_books`, `contact_groups`, `tax_categories`, product variants, finance ledgers, and system settings that do not exist in the current backend code.
- The current database and migration set therefore cannot be consolidated into the requested full target schema without first implementing a large number of missing modules.

## Plan

1. Capture the prompt, update task tracking, and scan the current EF model plus live PostgreSQL schema.
2. Compare the requested baseline against the implemented repository scope and identify blockers or missing modules.
3. If the requested scope exceeds the implemented system, stop and get user direction before making destructive migration-history changes.
