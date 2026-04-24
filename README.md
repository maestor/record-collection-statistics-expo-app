# Record Collection

React Native and Expo app for browsing a personal Discogs-backed record collection through the read-only Record Collection Statistics API.

## Features
- Dashboard with cache health, sync status, collection totals, year ranges, and top breakdowns.
- Searchable records catalog with sorting, filters, pagination, thumbnails, and detail pages.
- Record detail view with cover art, release metadata, formats, labels, tracks, identifiers, community stats, and collection data.
- Configurable API URL and optional API key for Android emulator, physical Android devices, and future remote API access.
- Generated TypeScript types from the API OpenAPI contract.

## Requirements
- Node.js and npm.
- Expo Go for the fastest local development loop.
- Record Collection Statistics API running locally for live data and API type generation.

The default API URL is `http://127.0.0.1:3003`. Android emulator users should set the app URL to `http://10.0.2.2:3003` in Settings.

## Commands
```bash
npm install
npm run generate:api-types
npm start
npm run verify
```

Use `npm run check:api-types` when the local API is running to confirm committed generated types match the current OpenAPI document.

## Docs
- [Development](docs/development.md)
- [Testing](docs/testing.md)
- [Android debug](docs/android-debug.md)
- [Accessibility](docs/accessibility.md)
- [Architecture](docs/architecture.md)

