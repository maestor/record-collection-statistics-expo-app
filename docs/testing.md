# Testing

Tests use `jest-expo` and `@testing-library/react-native`.

## Guidelines
- Test user behavior: text entry, button presses, loading states, errors, empty states, and rendered data.
- Mock `fetch` directly for API behavior.
- Avoid snapshot tests unless a small stable snapshot adds clear value.
- Prefer accessible queries such as `getByRole`, `getByLabelText`, and visible text.
- Keep generated OpenAPI types out of coverage.

## Required Scenarios
- Settings save, reset, and connection test.
- API key header behavior without printing or rendering secrets.
- Dashboard loading, success, error, and refresh.
- Records search, sort, filters, pagination, empty result, and API error.
- Record detail success, 404/error, and invalid release id.
- Accessibility labels and roles for navigation targets, controls, and alerts.

