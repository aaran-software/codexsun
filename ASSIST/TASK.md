# Current Task

## Prompt

Implement only the frontend/backend alignment that matches the existing real schema and current repository structure, without breaking any working modules or rewriting the baseline again.

## Objective

Extend the current Common module and admin UI only where the real `ProductionBaseline` and existing Common controllers already support it, replacing placeholder frontend common pages with API-backed list screens and a dedicated Admin Common navigation path.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Do not break the current production baseline schema or the working GUID-based Auth module.
- Keep backend, frontend, and documentation changes consistent with the real migration history in the repository.
- Use the existing `Common` backend module and current `CommonList` / `CommonUpsertDialog` frontend building blocks rather than introducing a conflicting parallel structure.

## Observed Repository State

- The active migration in `cxserver/Migrations` is `20260314133756_ProductionBaseline`, not `DatabaseStructureAuthToVendor`.
- The backend currently exposes `Auth`, `Common`, `Finance`, and `System` modules; separate `Location`, `Product`, `Contact`, and `Vendor` modules do not yet exist.
- The frontend already uses `CommonList` and `CommonUpsertDialog`, while the prompt still references the older `ListCommon` naming.
- The current schema does not include the full Prompt 013 target set for `user_roles`, `contacts`, `contact_addresses`, `companies`, `vendors`, `vendor_users`, `vendor_addresses`, or `product_categories`.
- The backend Common controllers already cover the real reusable masters that exist now: location, catalog, and operations masters.
- The frontend Common pages are still local mock screens and are not yet wired to the backend APIs.

## Plan

1. Capture the new instruction and update the task record for a non-breaking implementation against the current real schema.
2. Add API-backed frontend Common master clients, a registry-driven Common page, and Admin Common navigation for the masters already exposed by the backend.
3. Reuse the existing backend Common module surface and only add lightweight backend improvements if needed for the current frontend flow.
4. Rebuild frontend and backend, then update repository documentation and the project log.
