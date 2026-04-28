# Agent Instructions

## Principles
- Keep the app read-only unless the user explicitly asks for write behavior.
- Prefer strict TypeScript, user-behavior tests, and a small dependency footprint.
- Never store or request Discogs tokens in the app. The app may store only the API base URL and optional read API key.
- Update README or docs when behavior, setup, public interfaces, testing, or deployment flows change.
- Treat generated OpenAPI types as the app/backend contract. When the user says the API has a new or changed endpoint, response shape, parameter, or behavior, always treat that as an `api-contract-sync` task first, not a consumer-only change. Refresh the contract from the available API source of truth, regenerate the types, update consumers, and stop if the contract cannot be refreshed or verified.

## Implementation Expectations
- Use Expo Router routes under `app/`; keep components, providers, API code, and utilities under `src/`.
- Keep pure feature-specific helpers in feature-owned files under that feature, for example `src/features/records/records-helpers.ts` or `src/features/statistics/statistics-helpers.ts`, instead of leaving them inside screen or card components once they are reused or when multiple pure helpers accumulate.
- Keep component-local subcomponents and rendering-only pieces in the component file. Do not move UI-only inner components into helper files just for consistency.
- If a pure helper is shared across features, keep it in the feature it most naturally belongs to unless it has become truly app-wide domain logic.
- Prefer `fetch`, `URLSearchParams`, React Query, and a small typed API wrapper over generated runtime SDKs.
- Keep API keys out of logs, query keys, screenshots, and error messages.
- Use Expo Go first. Add or use a development client only when native dependencies require it.
- Preserve Android as the priority platform. iOS support should not block Android debug workflows.
- Implement only code needed by the current user-facing behavior. Do not add helpers, branches, optional parameters, fallback handling, or defensive checks for hypothetical future use.
- Type function inputs as narrowly as the current implementation requires. Use required strings, numbers, and concrete unions when callers always provide those values; widen to `null`, `undefined`, optional, or broader unions only when a real current call path needs it.
- Use `assertNever` for exhaustive `switch` defaults over union values. Keep the `assertNever` helper ignored from coverage and add `/* istanbul ignore next -- exhaustive type guard for impossible union values */` immediately before each impossible `default` case; the reachable behavior belongs in the real cases, not the impossible default.
- Prefer `condition && <Element />` for conditional JSX when the fallback is `null`. Use a ternary only when both branches render meaningful UI or values.
- Use the Pressable responder-state test helper only for user-visible pressed-condition style assertions. Do not use it for actions or normal interaction flows; use Testing Library press interactions there.
- Coverage ignores are allowed only for documented, currently unreachable guardrails that preserve user-facing resilience without adding a meaningful behavior path to test, such as non-JSON error-body fallbacks or exhaustive type guards.
- If a requested task seems to require unused code, speculative defensive logic, unreachable branches, or untestable behavior, stop and explain the issue before continuing. Do not change direction just to make coverage or implementation easier.

## Quality
- Run `npm run verify` after meaningful app changes.
- Run `npm run generate:api-types` after backend OpenAPI changes and whenever the user reports new API behavior that should already exist in the running API contract.
- Run `npm run check:api-types` whenever the local API is available for contract-sensitive work. Do not skip contract verification just because the consumer change looks small or obvious.
- Test user-visible behavior with Testing Library. Prefer interactions and assertions over snapshots.
- Prefer semantic React Native Testing Library matchers for rendered UI assertions, for example `toBeOnTheScreen`, `not.toBeOnTheScreen`, and `toHaveTextContent`, instead of generic `toBeTruthy` or `toBeNull` when asserting presence, absence, or content.
- Cover loading, success, empty, error, and accessibility states for user-facing screens.
- Include Expo Router routes and layouts under `app/` in coverage. Test route params, unsupported route fallbacks, provider/layout wiring, and navigation registration at the route level; keep detailed screen behavior tests in `src/` feature tests.
- Definition of Done: every new line of behavior added during a task must be covered by user-behavior tests in the same task. If complete behavior coverage is not practical, stop and raise that as a separate decision before merging or moving on.
- Do not add unit tests that exist only to raise coverage for unused helpers or unreachable branches. Remove the unused code or branch instead.
- Keep README focused on overview and common commands. Put detailed development, testing, Android debug, accessibility, and architecture notes under `docs/`.
- Treat `docs/plans/` as local planning scratch space. Do not commit plan files by default unless the user explicitly asks.

## Commit Strategy
- Work on a branch instead of `main`.
- Commit coherent batches after the relevant checks pass.
- Prefix commit messages with the change type, for example `Feature:`, `Chore:`, `Fix:`, or `Docs:`.
- Before creating a commit, make sure the batch is coherent and any available checks for that batch have been run.
- After completing, verifying, and committing a task, include copy-pasteable pull request notes in the chat wrapped in fenced code blocks.
