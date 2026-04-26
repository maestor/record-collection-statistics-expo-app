---
name: versioning
description: Manage app version bumps with the project scripts. Use when preparing a release, deciding whether a change is a feature or fix, running `npm run version:auto`, `npm run version:bump`, or `npm run version:set`, or keeping versioned files in sync.
version: 1.0.0
license: MIT
---

# Versioning

Use this skill when the user wants to bump, set, inspect, or prepare the app version.

## Source Of Truth

- `package.json` is the single source of truth for the app version.
- `app.config.js` reads that version into Expo config.
- The versioning scripts keep `app.json` and `package-lock.json` aligned.

## Commands

- `npm run version:auto`
- `npm run version:bump -- feature`
- `npm run version:bump -- fix`
- `npm run version:set -- <x.y.z>`

## Workflow

1. Inspect the current version and the latest relevant commit subject before choosing a command.
2. Use `npm run version:auto` only after a commit exists and its subject follows one of the supported prefixes.
3. Use `npm run version:bump -- feature` for user-visible additions or improvements when you want to choose the semantic class directly.
4. Use `npm run version:bump -- fix` for fixes, refactors, chores, docs, tests, CI, build changes, styling-only changes, and similar non-breaking maintenance work.
5. Use `npm run version:set -- <x.y.z>` only for explicit version decisions, especially major releases.
6. Review the resulting diff to confirm the version stayed aligned across the files the scripts manage.

## Supported Commit Prefixes

- Minor: `Feature:`, `Addition:`, `Improvement:`, `feat:`
- Patch: `Fix:`, `Refactor:`, `Chore:`, `Docs:`, `Test:`, `Build:`, `CI:`, `Perf:`, `Style:`, `Revert:`

## Guardrails

- Never infer a major version automatically.
- If the latest commit subject uses `!` or includes `BREAKING CHANGE:`, stop and ask for an explicit major-version decision.
- Do not edit version numbers manually when the project scripts can do the synchronization safely.
- Keep version bumps as their own coherent batch when practical, instead of mixing them into unrelated feature edits.
