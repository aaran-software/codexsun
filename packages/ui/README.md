# UI Package

This package owns shared frontend UI concerns for the platform.

Current scope:

- reusable UI components
- shared UI helpers
- global design tokens and stylesheet entry

Current rule:

- apps consume shared UI from `packages/ui`
- apps should not duplicate shared primitives that already belong here
- apps should consume the package by name: `@codexsun/ui`
