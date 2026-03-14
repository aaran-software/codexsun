# Current Task

## Prompt

read ai_rules and commit all and update all assists and update log and push all

## Objective

Review `ASSIST/AI_RULES.md`, capture the exact prompt, document the current frontend/admin UX work across the ASSIST files, then commit the full worktree using the next project-log serial and push the branch to `origin/main`.

## Constraints

- Follow `ASSIST/AI_RULES.md` and `ASSIST/STANDARDS.md`.
- Do not rewrite the source prompt text during prompt capture.
- Keep the current backend schema and API surface intact while documenting the frontend/admin UX work accurately.
- Use the next `CX-` serial in both `ASSIST/PROJECT_LOG.md` and the commit message.
- Build must remain green before the source control handoff.

## Observed Repository State

- `cxstore` now contains extensive admin UX updates across shared form primitives, popup dialogs, list tables, status badges, animated app loader, and sidebar behavior.
- `framer-motion` was added to `cxstore` for the shared global loader animation.
- Common master popup selects now use shared autocomplete behavior, and selected option labels are rendered instead of raw IDs.
- The City popup now includes state context so district creation can be offered safely from the district autocomplete.

## Plan

1. Capture the exact prompt in `prompts/032.md`.
2. Update all ASSIST documentation files to reflect the current frontend/admin UX state and source-control handoff.
3. Add a new `CX-030` project log entry summarizing the completed worktree.
4. Build `cxstore`, commit the worktree with the `CX-030` serial, and push `main` to `origin`.
