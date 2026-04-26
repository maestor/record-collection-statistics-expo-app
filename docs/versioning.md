# Versioning

This app now starts versioning from `1.0.0`.

## Source Of Truth

- `package.json` is the single source of truth for the app version.
- `app.config.js` copies that value into Expo config so `expo.version` stays aligned.
- The versioning scripts also keep `app.json` and `package-lock.json` in sync.

## Rules

- Minor releases are for user-visible additions and improvements.
- Patch releases are for fixes, refactors, chores, docs, tests, CI, build changes, styling-only changes, and similar non-breaking maintenance work.
- Major releases are never inferred automatically in this project. They happen only when you explicitly approve them.
- If a commit uses `!` or includes `BREAKING CHANGE:`, the automatic command stops and asks for an explicit major decision instead of guessing.

## Supported Commit Prefixes

Automatic versioning reads the latest commit subject and maps these prefixes case-insensitively:

- Minor: `Feature:`, `Addition:`, `Improvement:`, `feat:`
- Patch: `Fix:`, `Refactor:`, `Chore:`, `Docs:`, `Test:`, `Build:`, `CI:`, `Perf:`, `Style:`, `Revert:`

## Commands

Use these commands instead of editing version numbers manually:

```bash
npm run version:auto
npm run version:bump -- feature
npm run version:bump -- fix
npm run version:set -- 2.0.0
```

`npm run version:auto` inspects the latest commit message and bumps either `minor` or `patch`.

`npm run version:bump -- <change-type>` is the fallback when you want to choose the semantic change class directly for the current development batch.

`npm run version:set -- <x.y.z>` is the explicit path for a major release or any other intentional exact version.
