# Testing

Tests use `jest-expo` and `@testing-library/react-native`.

## Guidelines
- Test user behavior: text entry, button presses, loading states, errors, empty states, and rendered data.
- Mock `fetch` directly for API behavior.
- Avoid snapshot tests unless a small stable snapshot adds clear value.
- Prefer accessible queries such as `getByRole`, `getByLabelText`, and visible text.
- Prefer shared translation and formatting helpers in tests instead of hardcoded UI copy so locale text changes do not break assertions.
- Treat test warnings as failures to fix, not as acceptable noise. This includes React `act(...)` warnings, unexpected `console.error` output, and library warnings triggered by unfinished async work in a test.
- Keep generated OpenAPI types out of coverage.
- Every behavior added by a task must be tested in that task. A task is incomplete until its new loading, success, empty, error, interaction, and accessibility paths are covered where they apply.
- Do not create helper-only or implementation-only tests to justify unused code. If a helper, branch, optional parameter, or fallback is not reached by current user behavior, remove it.
- When full behavior testing is blocked or would require changing the product decision, pause and document the issue before continuing.
- Include Expo Router files under `app/` in coverage. Test route-level behavior there: route params, invalid route fallbacks, layout/provider wiring, tab/stack screen registration, and navigation targets. Keep deep screen behavior tests next to the feature screens in `src/`.
- Use `assertNever` for exhaustive `switch` defaults over union values. Ignore the `assertNever` utility from coverage and add `/* istanbul ignore next -- exhaustive type guard for impossible union values */` immediately before each impossible `default` case so the consumer-side unreachable branch is ignored too.
- Prefer `condition && <Element />` for JSX that renders nothing otherwise. Keep ternaries for real alternate UI states, not `: null` fallbacks.
- Use the Pressable responder-state helper only for user-visible `Pressable` pressed-condition style assertions. This helper exists because React Native Testing Library press events do not toggle `Pressable`'s internal pressed style state; never use it to test actions, navigation, or form behavior.
- Use coverage ignores only for documented unreachable guardrails, for example exhaustive type guards or API resilience fallbacks that cannot be reached through current user-behavior tests without implementation-only mocking.

## Required Scenarios
- API configuration from Expo environment values.
- API key header behavior without putting the key in URLs, query keys, screenshots, or rendered UI.
- Dashboard loading, success, error, and refresh.
- Statistics loading, success, error, list and graph view switching, and dimension switching.
- Records search, sort, filters, pagination, empty result, and API error.
- Record detail success, 404/error, and invalid release id.
- App routes render their intended screens, parse route params, reject unsupported params, and register stack/tab navigation with the expected labels and options.
- Accessibility labels and roles for navigation targets, controls, and alerts.
