# Current Task

## Prompt

036_COMMERCE_TRANSACTION_SYSTEM

## Objective

Implement cart, order, billing, payment, and vendor-payout capabilities in the repository’s existing backend/frontend architecture without creating the prompt’s requested but nonexistent `cxstore/src/modules` feature layout.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Capture the prompt exactly in `prompts/036.md` before implementation.
- Reuse existing module conventions in `cxserver/Modules/*` and current frontend organization under `cxstore/src/{api,components,pages,types}`.
- Do not introduce a parallel company or vendor domain if the current Auth role model and existing product/contact ownership are the active isolation mechanism.
- Preserve existing Auth, Common, Contacts, Products, and admin UX behavior.
- Ensure backend and frontend builds pass before closeout.

## Observed Repository State

- The backend currently uses transactional modules such as `Contacts` and `Products` with entities, configurations, DTOs, services, and controllers under `cxserver/Modules/*`.
- Common master coverage already includes reusable `currencies`, `warehouses`, and related operational masters that the commerce transaction system should reuse.
- The prompt references frontend folders under `cxstore/src/modules`, but the real frontend is built around shared `api`, `components`, `pages`, `types`, and `state` folders.
- Vendor isolation today is implemented through Auth users plus optional `VendorUserId` ownership on transactional records rather than separate `companies` or `vendors` tables.

## Plan

1. Analyze current backend module patterns, database model registration, auth permissions, and frontend page/routing/menu conventions relevant to transactional commerce features.
2. Design an adapted commerce transaction scope that fits the current repository, including carts, orders, invoices, payments, vendor earnings, and vendor payouts tied to existing contacts/products/common masters.
3. Implement backend entities, configurations, DTOs, validators, services, controllers, permission seeding, and migrations for the missing commerce transaction capabilities.
4. Implement frontend API clients, types, pages, shared UI pieces, route wiring, and menu updates using the repo’s current structure rather than a new module folder pattern.
5. Run builds, then update ASSIST documentation and the project log to reflect the new transaction architecture.
