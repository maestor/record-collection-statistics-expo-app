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

The app stores the API base URL and optional API key in Settings. Use these defaults:

- Desktop/web simulator: `http://127.0.0.1:3003`
- Android emulator: `http://10.0.2.2:3003`
- Physical Android: `http://<computer-lan-ip>:3003`

For a physical Android device, the API must be reachable from the phone over the local network. If the backend only listens on `127.0.0.1`, restart it so it also listens on the LAN interface.

## Verification
```bash
npm run typecheck
npm run lint
npm test -- --watchAll=false
npm run verify
```
