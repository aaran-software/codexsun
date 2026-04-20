# Testing Policy

## Mandatory Validation

Before commit:

1. run lint
2. run type-safety validation
3. run tests
4. fix failures before commit

## Current Command Baseline

Current available commands are:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

## Discipline Rule

The missing test command is a current repo gap, not a reason to weaken the standard.

The current test layer is only a baseline smoke test. Expand it as domain modules and richer runtime behavior are introduced.
