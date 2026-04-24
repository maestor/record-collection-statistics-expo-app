# Testing

Tests use `jest-expo` and `@testing-library/react-native`.

## Guidelines
- Test user behavior: text entry, button presses, loading states, errors, empty states, and rendered data.
- Mock `fetch` directly for API behavior.
- Avoid snapshot tests unless a small stable snapshot adds clear value.
- Prefer accessible queries such as `getByRole`, `getByLabelText`, and visible text.
- Prefer shared translation and formatting helpers in tests instead of hardcoded UI copy so locale text changes do not break assertions.
- Keep generated OpenAPI types out of coverage.

## Required Scenarios
- API configuration from Expo environment values.
- API key header behavior without putting the key in URLs, query keys, screenshots, or rendered UI.
- Dashboard loading, success, error, and refresh.
- Records search, sort, filters, pagination, empty result, and API error.
- Record detail success, 404/error, and invalid release id.
- Accessibility labels and roles for navigation targets, controls, and alerts.
