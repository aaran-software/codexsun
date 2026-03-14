# Current Task

## Prompt

read AI_RULES and commit all and push all and log all

## Objective

Read the repository AI operating rules, record the current work in the project log, and deliver the full repository state through a commit and push.

## Constraints

- Follow `ASSIST/AI_RULES.md` for prompt capture, logging, and commit-message serial usage.
- Commit the entire current worktree, including user changes already present in the repository.
- Avoid rewriting existing implementation details while preparing the source-control handoff.

## Observed Repository State

- `ASSIST/AI_RULES.md` requires a project-log entry before any commit and requires the latest `CX-###` serial in the commit message.
- The repository is on `main` with local modifications across backend, frontend, tests, docs, prompt files, and prompt deletions.
- `ASSIST/PROJECT_LOG.md` currently ends at `CX-018`, so the next compliant serial is `CX-019`.

## Plan

1. Capture this prompt in `prompts/018.md`.
2. Append a `CX-019` entry to `ASSIST/PROJECT_LOG.md` describing the current handoff and source-control action.
3. Stage all repository changes, create a commit using the `CX-019` serial, and push `main` to `origin`.
