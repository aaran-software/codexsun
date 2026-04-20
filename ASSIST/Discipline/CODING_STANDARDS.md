# Coding Standards

## Core Rules

1. write code in TypeScript
2. keep modules small and responsibility-focused
3. keep public contracts explicit
4. keep infrastructure, domain logic, and presentation separate
5. build the MVP path first
6. do not overengineer

## Modular Monolith Rules

1. each module owns its internals
2. each module exposes only clear public contracts
3. do not let one module reach into another module's private files or data stores
4. shared packages must stay generic and infrastructural
5. app-owned code stays in the owning app or module unless true reuse proves otherwise

## DDD Rules

1. keep bounded contexts explicit
2. keep aggregates narrow and consistency-focused
3. keep value objects and entities inside the owning domain
4. keep application services orchestrational, not persistence dumping grounds
5. prefer extracting focused services, validators, mappers, and handlers over growing giant domain files

## EDA Rules

1. events are facts, not commands
2. event names must be stable and intentional
3. event payloads must be typed
4. handlers must be observable and preferably idempotent
5. use a simple event bus first

## UI Rules

1. UI code must respect domain boundaries
2. page composition, design-system primitives, and module-specific screens must remain clearly separated
3. ERP workflows should favor consistency, density, and operator speed over decorative novelty

## File Discipline

1. prefer files below 500 lines where practical
2. treat 700 lines as the upper limit before splitting
3. if a file grows beyond that range or mixes concerns, split it into smaller focused files immediately
4. split by ownership and responsibility, not by arbitrary folders
