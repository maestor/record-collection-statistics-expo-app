# Agent Instructions

## Principles
- Keep the app read-only unless the user explicitly asks for write behavior.
- Prefer strict TypeScript, user-behavior tests, and a small dependency footprint.
- Never store or request Discogs tokens in the app. The app may store only the API base URL and optional read API key.
- Update README or docs when behavior, setup, public interfaces, testing, or deployment flows change.
- Treat generated OpenAPI types as the app/backend contract. Regenerate them after API schema changes.

## Implementation Expectations
- Use Expo Router routes under `app/`; keep components, providers, API code, and utilities under `src/`.
- Prefer `fetch`, `URLSearchParams`, React Query, and a small typed API wrapper over generated runtime SDKs.
- Keep API keys out of logs, query keys, screenshots, and error messages.
- Use Expo Go first. Add or use a development client only when native dependencies require it.
- Preserve Android as the priority platform. iOS support should not block Android debug workflows.

## Quality
- Run `npm run verify` after meaningful app changes.
- Run `npm run generate:api-types` after backend OpenAPI changes.
- Run `npm run check:api-types` when the local API is available and API compatibility matters.
- Test user-visible behavior with Testing Library. Prefer interactions and assertions over snapshots.
- Cover loading, success, empty, error, and accessibility states for user-facing screens.
- Keep README focused on overview and common commands. Put detailed development, testing, Android debug, accessibility, and architecture notes under `docs/`.
- Treat `docs/plans/` as local planning scratch space. Do not commit plan files by default unless the user explicitly asks.

## Commit Strategy
- Work on a branch instead of `main`.
- Commit coherent batches after the relevant checks pass.
- Prefix commit messages with the change type, for example `Feature:`, `Chore:`, `Fix:`, or `Docs:`.

