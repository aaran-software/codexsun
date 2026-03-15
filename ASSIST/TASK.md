# Current Task

## Prompt

PROMPT 042 - Vendor-Owned Warehouses And Vendor-Scoped Access

## Objective

Extend the existing vendor-company implementation so warehouses can be owned by vendor businesses and operational access is scoped by vendor company membership across inventory-facing and vendor-facing workflows, with matching frontend support.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Capture the prompt in `prompts/042.md` before implementation.
- Do not create a second warehouse system; reuse the existing Common `warehouses` master.
- Preserve existing module boundaries and keep changes additive.
- Do not remove existing `vendor_user_id` behavior; expand access and ownership through `vendor_id` and vendor-company membership.
- Keep backend/frontend architecture intact and validate builds/tests after implementation.

## Observed Repository State

- `warehouses` currently live in the Common operational master module and only store `name` and `location`.
- Inventory already references warehouses everywhere but does not currently enforce vendor-company ownership.
- Products and Sales already started additive `vendor_id` support, but Contacts and warehouse-facing UX still rely on individual-user assumptions or admin-only master screens.
- Vendor users currently have no dedicated warehouse page or inventory routes in the frontend.

## Plan

1. Extend the existing warehouse master with additive vendor ownership and expose vendor-aware warehouse listing without changing the master-data architecture.
2. Update backend access rules so vendor-company membership governs warehouse visibility and inventory/contact access where appropriate.
3. Add frontend support for warehouse ownership in the admin warehouse form and vendor-facing warehouse/inventory screens/routes.
4. Add/update tests, run migrations/build/tests, and update ASSIST documentation/logs.
