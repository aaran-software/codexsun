# Versioning And Releases

## Required Serial Format

Use one serial reference across:

1. task id
2. planning entry
3. changelog version
4. git commit message
5. release tag

Required format:

1. task ref:
   `#194`
2. changelog label:
   `v 1.0.194`
3. release tag:
   `v-1.0.194`
4. commit message:
   `#194 - Fix mail settings save payload coercion`

## Changelog Header Format

Use this structure:

```markdown
# Changelog

## Version State

- Current package version: `1.0.194`
- Current release tag: `v-1.0.194`
- Reference format: changelog labels use `v 1.0.<number>`, task refs use `#<number>`, and release tags use `v-1.0.<number>`

## v-1.0.194

### [v 1.0.194] 2026-04-20 - Fix mail settings save payload coercion
```

## Rule

Every implementation or refactor batch must increment the serial and update the version state before commit.
