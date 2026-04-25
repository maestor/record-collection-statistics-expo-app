# Testing

Tests use `jest-expo` and `@testing-library/react-native`.

## Guidelines
- Test user behavior: text entry, button presses, loading states, errors, empty states, and rendered data.
- Mock `fetch` directly for API behavior.
- Avoid snapshot tests unless a small stable snapshot adds clear value.
- Prefer accessible queries such as `getByRole`, `getByLabelText`, and visible text.
- Prefer shared translation and formatting helpers in tests instead of hardcoded UI copy so locale text changes do not break assertions.
- Keep generated OpenAPI types out of coverage.
- Every behavior added by a task must be tested in that task. A task is incomplete until its new loading, success, empty, error, interaction, and accessibility paths are covered where they apply.
- Do not create helper-only or implementation-only tests to justify unused code. If a helper, branch, optional parameter, or fallback is not reached by current user behavior, remove it.
- When full behavior testing is blocked or would require changing the product decision, pause and document the issue before continuing.

## Required Scenarios
- API configuration from Expo environment values.
- API key header behavior without putting the key in URLs, query keys, screenshots, or rendered UI.
- Dashboard loading, success, error, and refresh.
- Records search, sort, filters, pagination, empty result, and API error.
- Record detail success, 404/error, and invalid release id.
- Accessibility labels and roles for navigation targets, controls, and alerts.
