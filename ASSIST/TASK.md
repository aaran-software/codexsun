# Current Task

## Prompt

PROMPT NAME: 009_FRONTEND_LISTCOMMON_SKELETON

## Objective

Expand `ListCommon` into a reusable generic list-page skeleton for the React frontend with standardized header, search/filter controls, active filter chips, generic table rendering, footer, and pagination, then apply it to the existing admin list pages.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Preserve the existing `AppLayout` and current admin route structure.
- Keep `ListCommon` generic, strongly typed, and free of module-specific fetching or business logic.
- Use existing frontend primitives where possible and keep the layout theme-aware and responsive.

## Observed Repository State

- `ListCommon` currently renders only a page header with an add button.
- `UsersPage` and `RolesPage` still wrap search, loading, and table concerns outside the shared component.
- `AdminTable` is generic enough to inform the new structure, but it does not provide the full skeleton sections required by the prompt.

## Plan

1. Capture the prompt and update planning docs for the generic `ListCommon` skeleton.
2. Rebuild `ListCommon` with structured props for header, search/filter controls, active filters, generic table rendering, footer, and pagination.
3. Refactor existing admin list pages to use the new skeleton shape, then verify the frontend build and update repo documentation/logs.
