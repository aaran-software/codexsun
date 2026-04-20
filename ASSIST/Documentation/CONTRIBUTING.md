# Contributing

## Mandatory Workflow

Before implementation:

1. read the core ASSIST docs
2. create or update the task in `ASSIST/Execution/TASK.md`
3. create or update the plan in `ASSIST/Execution/PLANNING.md`
4. only then start implementation or refactor work

This is mandatory for meaningful work. Planning is not optional.

## During Implementation

1. keep the change boundary-correct
2. keep docs aligned when architecture, workflow, or discipline changes
3. record every real implementation or refactor in `ASSIST/Documentation/CHANGELOG.md`
4. use the same serial reference across task, planning, changelog, and commit message
5. build the MVP flow first
6. split files before they become oversized mixed-responsibility surfaces
7. keep new code easy to read and easy to maintain
8. create isolated engines only when the runtime concern is genuinely reusable

## Before Commit

Before any commit:

1. update the changelog entry
2. increment the tracked release serial
3. run lint
4. run type-safety validation
5. run tests
6. fix failures before commit
7. commit with the required serial-based message format

## Current Gap Rule

If the repository does not yet provide the full validation commands, do not fake compliance.

Instead:

1. run the commands that do exist
2. document the missing command or missing coverage
3. keep the missing discipline visible until the scaffold adds it

## Handoff Expectations

When summarizing work, state:

1. what changed
2. what was validated
3. which required validations are still missing in the repo
4. what risks or open decisions remain
