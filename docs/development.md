# Development

## Local API

Run the Record Collection Statistics API first. The app expects the API to expose OpenAPI at:

```bash
http://127.0.0.1:3003/openapi.json
```

Generate API types after API schema changes:

```bash
npm run generate:api-types
```

Check whether committed types are stale:

```bash
npm run check:api-types
```

## Start The App

Use Expo Go first:

```bash
npm start
```

App branding assets live in `assets/`:

- `icon.png`: primary app icon for Expo/iOS and the base Android launcher icon.
- `adaptive-icon-foreground.png`: transparent foreground used with the Android adaptive icon background color.
- `splash-icon.png`: centered splash mark shown on top of the splash background color.
- `favicon.png`: web favicon.

If Expo Go keeps showing an older icon or splash screen after asset changes, restart the bundler with a cleared cache:

```bash
npx expo start --clear
```

Create an installable Android preview build when you want to run the app on your phone without Expo Go:

```bash
npm run preview-app
```

This uses the `preview` EAS profile to create an internal-distribution Android APK. When the build finishes, Expo provides an install link and QR code you can open on your phone.

The app reads API connection values from Expo config:

- `API_URL`: remote API URL, usually your Vercel domain.
- `API_KEY`: required read API key sent as `x-api-key`.

These are mapped into app config by `app.config.js`, so EAS builds and updates can use the values already set on the Expo project. Pull them locally when you want Expo Go to use the same development environment:

```bash
npx eas-cli@latest env:pull --environment development
```

Set `API_KEY` with `sensitive` or `plain text` visibility in Expo. Do not use `secret` visibility for values the app must embed, because secret variables are intended for EAS jobs and are not available to client-side app code.

If `API_URL` is not set, the app uses the Android emulator default `http://10.0.2.2:3003`. Physical Android devices should set `API_URL` to the Vercel API or a local-network URL such as `http://<computer-lan-ip>:3003`.

For a physical Android device, the API must be reachable from the phone over the local network. If the backend only listens on `127.0.0.1`, restart it so it also listens on the LAN interface.

The read API key is embedded in the app bundle. Treat it as a client-visible gate key, not a private server secret.

## Cached API Data

The app keeps TanStack Query data in local storage for up to 24 hours so repeated launches do not immediately reread stable API endpoints.

- Dashboard, breakdowns, record details, and filter catalogs reuse cached data until their query-specific stale windows expire.
- The records screen loads filter values only when the filter sheet is opened.
- Pull-to-refresh and retry actions still force a fresh request when the user asks for one.

## Verification

Before verification, review the task diff for unused implementation:

- Remove helpers, fallback branches, optional inputs, and defensive checks that no current user path reaches.
- Keep parameter types as narrow as the current call sites allow.
- Make sure every behavior added by the task has user-behavior test coverage. If that cannot be done, stop and decide the exception separately.
- Prefer `const` arrow functions over function declarations. ESLint enforces this with `func-style`.
- In Expo UI code, inline styles are fine for one-off layout. Extract only repeated visual recipes into shared theme styles such as screen containers, card frames, wrap rows, or filter chips.
- Promote a repeated UI pattern to a shared component only when it carries styling plus behavior, interaction state, or accessibility semantics. Keep purely visual reuse in shared style objects.

```bash
npm run typecheck
npm run lint
npm test -- --watchAll=false
npm run verify
```
