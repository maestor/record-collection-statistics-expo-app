---
name: api-contract-sync
description: Sync the Expo app with backend OpenAPI contract changes. Use when backend schema changed, generated API types may be stale, `npm run generate:api-types` or `npm run check:api-types` should be run, or app code/tests/docs need updates to match a new API contract.
version: 1.0.0
license: MIT
---

# API Contract Sync

Use this skill when the backend OpenAPI contract changed or when the app looks out of sync with generated API types.

## Contract Files

- Generated contract file: `src/api/generated/record-collection-api.ts`
- Runtime client: `src/api/client.ts`
- Query hooks: `src/api/queries.ts`
- Local schema URL expected by the generator: `http://127.0.0.1:3003/openapi.json`

## Commands

- `npm run generate:api-types`
- `npm run check:api-types`

## Workflow

1. Decide whether the task is a real contract change or only an app-side bug.
2. If the backend schema changed, run `npm run generate:api-types`.
3. Review the generated diff before editing app code.
4. Update only the app code that actually depends on the changed contract.
5. If a local API is available and compatibility matters, run `npm run check:api-types`.
6. Run `npm run verify` after meaningful app-code changes.

## Guardrails

- Treat generated OpenAPI types as the contract source of truth. Do not hand-edit generated files.
- Keep changes narrow to the current backend behavior. Do not add speculative fallback branches for hypothetical future schema states.
- Keep API keys out of logs, screenshots, query keys, and test output.
- If `check:api-types` cannot run because the local API is unavailable, say so explicitly and continue with the generated-type sync work that is still possible.
- Update user-behavior tests in the same task when contract changes affect rendered behavior.
- Update docs when setup, public behavior, or contract-driven workflows changed.
