# CLI App

`apps/cli` is the operational plugin app for repository helpers and CI/CD-facing commands.

Current scope:

- git helper
- version sync helper

Current host rule:

- CLI behavior stays app-owned under `apps/cli`
- command entrypoints are invoked from the repository root, not from a separate host app
