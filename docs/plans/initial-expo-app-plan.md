# Initial Expo App Plan With Generated API Types

## Summary
Build a strict TypeScript Expo app for the read-only record collection API, starting with Dashboard + Catalog: stats, searchable records, record detail pages, settings for API connection, and Android debug docs.

Before implementation edits, write this plan into `docs/plans/initial-expo-app-plan.md` as the first project artifact. `docs/plans/` will be gitignored as planning scratch unless you later ask to commit a plan.

## Key Changes
- Start from a working branch, not `main`.
- Scaffold an Expo Router app with:
  - Dashboard at `/`
  - Records at `/records`
  - Record detail at `/records/[releaseId]`
  - Settings at `/settings`
- Add `openapi-typescript` as a dev dependency.
- Generate tracked API types at `src/api/generated/record-collection-api.ts`.
- Add scripts:
  - `generate:api-types`
  - `check:api-types`
  - `verify`
- Use a small runtime dependency set:
  - `@tanstack/react-query`
  - `expo-secure-store`
  - `expo-image`
  - Testing Library + `jest-expo`
- Avoid full generated SDKs, chart libraries, and mutation testing in v1.

## API And Data Flow
- Generate types from `http://127.0.0.1:3003/openapi.json`.
- Commit generated types so the app can typecheck without the API running.
- Build a small typed fetch layer for health, dashboard, filters, records, record detail, and breakdowns.
- Store configurable API base URL and optional API key in Settings.
- Send `x-api-key` only when configured.
- Use `fetch`, `URLSearchParams`, `AbortController` timeouts, safe error messages, and no Discogs tokens.

## Implementation Batches
- Batch 0: Write this plan to `docs/plans/initial-expo-app-plan.md` and add `docs/plans/` to `.gitignore`.
- Batch 1: Scaffold Expo app, strict TS, route shell, theme, lint/test/typecheck scripts.
- Batch 2: Add OpenAPI type generation, API client, React Query provider, Settings, and connection test.
- Batch 3: Add Dashboard with health/sync status, totals, ranges, and top breakdown rows.
- Batch 4: Add Records list with search, sort, filters, pagination, and detail screen.
- Batch 5: Add Android debug docs/config: Expo Go first, then EAS development APK path.

## Testing And Docs
- Test user behavior with Testing Library:
  - Settings save/load
  - API key header behavior without exposing secrets
  - Dashboard loading/success/error/empty states
  - Record search/filter/sort/pagination
  - Detail rendering and 404/error states
  - Accessibility labels, roles, and readable error messages
- Mock `fetch` directly unless tests become painful.
- README covers overview and setup.
- AGENTS.md adapts the API repo guidance for this app.
- Docs cover development, testing, Android debug, accessibility, and architecture.
- Document API update workflow: `npm run generate:api-types && npm run verify`.

## Assumptions
- Use `openapi-typescript`; `typescript-openapi` is not published on npm.
- App remains read-only.
- Android debug is the priority.
- Expo Go is the first run path; Android development APK comes after the scaffold is stable.
