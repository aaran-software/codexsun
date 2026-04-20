# Release Discipline

## Release Gate

Before release or commit-ready delivery:

1. task exists
2. plan exists
3. changelog entry exists
4. version serial is incremented
5. lint passes
6. type-safety validation passes
7. tests pass

## Required Validation Order

1. `npm run lint`
2. type-safety validation such as `npm run build` or a dedicated `typecheck`
3. `npm run test`

Fix failures before commit.

## Current Gap Rule

If the repository does not yet expose one of these commands, the gap must be documented explicitly and should be closed in upcoming scaffold work.
