# Branching And Commits

## Branching

1. use short-lived branches for one coherent task
2. keep unrelated changes out of the same branch
3. align the branch work to one active task serial where practical

## Commit Discipline

1. every meaningful implementation or refactor must have a task entry first
2. every meaningful implementation or refactor must have a planning entry first
3. every meaningful implementation or refactor must be logged in the changelog before commit
4. task serial, changelog serial, and commit serial must match
5. commit message format is mandatory:
   `#<serial> - <message>`

Example:

`#194 - Fix mail settings save payload coercion`

## Before Commit

1. changelog updated
2. version serial incremented
3. lint run
4. type-safety validation run
5. tests run
6. failures fixed or missing validation explicitly documented
