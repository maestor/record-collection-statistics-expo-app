# Agent Instructions

## Shared Skills
- Use `$project-documentation` when updating `README.md`, `docs/**`, contributor guidance, or repository workflow docs.
- Use `$git-pr-workflow` for the standard branch, review, final-verify, commit, push, and PR-notes flow.
- Use `$api-contract-sync` first when the user reports new or changed API behavior so the app and generated types stay aligned with the backend contract.

## Principles
- Keep the app read-only unless the user explicitly asks for write behavior.
- Prefer strict TypeScript, user-behavior tests, and a small dependency footprint.
- Never store or request Discogs tokens in the app. The app may store only the API base URL and optional read API key.
- Update README or docs when behavior, setup, public interfaces, testing, or deployment flows change.

## Implementation Expectations
- Use Expo Router routes under `app/`; keep components, providers, API code, and utilities under `src/`.
- Keep pure feature-specific helpers in feature-owned files under that feature instead of leaving them inside screen or card components once they are reused or when multiple pure helpers accumulate.
- Keep component-local subcomponents and rendering-only pieces in the component file. Do not move UI-only inner components into helper files just for consistency.
- If a pure helper is shared across features, keep it in the feature it most naturally belongs to unless it has become truly app-wide domain logic.
- Prefer `fetch`, `URLSearchParams`, React Query, and a small typed API wrapper over generated runtime SDKs.
- Keep API keys out of logs, query keys, screenshots, and error messages.
- Use Expo Go first. Add or use a development client only when native dependencies require it.
- Preserve Android as the priority platform. iOS support should not block Android debug workflows.
- Implement only code needed by the current user-facing behavior. Do not add helpers, branches, optional parameters, fallback handling, or defensive checks for hypothetical future use.
- Type function inputs as narrowly as the current implementation requires.
- Use `assertNever` for exhaustive `switch` defaults over union values. Keep the helper ignored from coverage and add `/* istanbul ignore next -- exhaustive type guard for impossible union values */` immediately before each impossible `default` case.
- Prefer `condition && <Element />` for conditional JSX when the fallback is `null`.
- Use the Pressable responder-state test helper only for user-visible pressed-condition style assertions.
- Coverage ignores are allowed only for documented, currently unreachable guardrails that preserve user-facing resilience without adding a meaningful behavior path to test.
- If a requested task seems to require unused code, speculative defensive logic, unreachable branches, or untestable behavior, stop and explain the issue before continuing.

## Quality
- Run `npm run verify` after meaningful app changes.
- Run `npm run generate:api-types` after backend OpenAPI changes and whenever the user reports new API behavior that should already exist in the running API contract.
- Run `npm run check:api-types` whenever the local API is available for contract-sensitive work.
- Test user-visible behavior with Testing Library. Prefer interactions and assertions over snapshots.
- Prefer semantic React Native Testing Library matchers for rendered UI assertions.
- Cover loading, success, empty, error, and accessibility states for user-facing screens.
- Include Expo Router routes and layouts under `app/` in coverage.
- Definition of Done: every new line of behavior added during a task must be covered by user-behavior tests in the same task.
- Do not add unit tests that exist only to raise coverage for unused helpers or unreachable branches.
- Keep README focused on overview and common commands. Put detailed development, testing, Android debug, accessibility, and architecture notes under `docs/`.
- Treat `docs/plans/` as local planning scratch space. Do not commit plan files by default unless the user explicitly asks.

## Repo-Specific Workflow Overrides
- Follow the shared Git workflow skill, but keep commits coherent and make sure the relevant checks for the batch have been run before creating a commit.
