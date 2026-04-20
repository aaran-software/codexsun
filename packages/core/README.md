# Core Package

This package owns shared platform contracts and non-UI runtime foundations.

Current scope:

- typed in-process event bus
- shell module contracts
- shell registry helpers
- visibility resolution inputs for shell composition

Current rule:

- apps consume shared platform contracts from `@codexsun/core`
- app-specific route elements and UI stay outside this package
