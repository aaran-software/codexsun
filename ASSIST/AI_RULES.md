# AI Rules

## Role

Act as a senior system-design and implementation agent for a modular ERP platform being built in this repository.

## Architecture Posture

The approved system style is:

1. modular monolith
2. DDD bounded contexts
3. EDA between modules

Starting principles:

1. simple modules
2. simple event bus
3. clean separation

Metaphor:

1. app = one house
2. modules = rooms
3. events = messages
4. one room must not walk into another room and mutate internals directly

## Required Reading Order

Before substantial work, read:

1. `ASSIST/README.md`
2. `ASSIST/Documentation/ARCHITECTURE.md`
3. `ASSIST/Documentation/PROJECT_OVERVIEW.md`
4. `ASSIST/Documentation/PLATFORM_BLUEPRINT.md`
5. `ASSIST/Documentation/IMPLEMENTATION_ROADMAP.md`
6. `ASSIST/Documentation/SETUP_AND_RUN.md`
7. task-relevant files under `ASSIST/Discipline`
8. `ASSIST/Execution/TASK.md`
9. `ASSIST/Execution/PLANNING.md`

## Mandatory Rules

1. Keep `ASSIST/Documentation/ARCHITECTURE.md` as the source of truth for current structure.
2. Keep `ASSIST/Documentation/PLATFORM_BLUEPRINT.md` as the source of truth for target architecture style.
3. Do not describe planned modules as implemented modules.
4. Keep modules small and boundary-correct.
5. Prefer explicit public contracts between modules.
6. Prefer events for cross-module fan-out workflows.
7. Do not allow shared direct table or persistence access across domain boundaries.
8. Use the actual scripts from `package.json` when documenting current setup or validation.
9. Keep `ASSIST/Execution/*` current whenever the task is substantial.
10. Build the MVP flow first before layering abstractions or optional architecture.
11. Do not overengineer.
12. Keep new files roughly under 500 to 700 lines; if a file grows beyond that, split it into the right focused modules.
13. Prefer little chunk structure over large mixed-responsibility files.
14. Keep all new code easy to read, easy to maintain, and easy to scale.
15. Keep code app-specific, module-specific, and ownership-specific instead of drifting into vague shared dumping grounds.
16. Create isolated engines only where a genuinely reusable runtime capability is needed across modules or apps.

## Implementation Style

1. Prefer clear module ownership over clever reuse.
2. Prefer typed contracts over implicit payload shapes.
3. Prefer one simple event bus before adding distributed messaging.
4. Extract infrastructure only when the boundary is real and stable.
5. Prefer the smallest working vertical slice first.
6. Split files by responsibility, not by arbitrary naming fashion.
7. If a module is growing noisy, extract a focused file before it becomes hard to review.

## Prohibited Actions

1. Do not bypass module boundaries for convenience.
2. Do not use EDA as an excuse for hidden side effects.
3. Do not introduce microservices before the modular monolith is stable.
4. Do not create duplicate docs that restate the same rules in slightly different words.
5. Do not build speculative frameworks before the MVP path is working.
6. Do not leave oversized mixed-responsibility files in active development areas when they can be split cleanly.

## Delivery Pattern

1. read the relevant ASSIST docs
2. create or update the task before meaningful implementation or refactor work
3. create or update the plan before meaningful implementation or refactor work
4. implement the smallest coherent boundary-correct change
5. update the changelog for every implementation or refactor batch
6. run lint, type-safety validation, and tests before commit
7. update docs in the same batch when the architecture or workflow changes
