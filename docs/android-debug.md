# Android Debug

## Expo Go First
Pull the Expo development environment when you want local Expo Go to use the configured Vercel API:

```bash
npx eas-cli@latest env:pull --environment development
npm start
```

Otherwise, start Metro with the local fallback values:

```bash
npm start
```

If `API_URL` is not set, Android uses `http://10.0.2.2:3003` for the emulator. Physical Android devices should use the Vercel API or a local-network URL such as `http://<computer-lan-ip>:3003`.

For physical devices with a local API, the phone and API host computer must be on the same network. Set `API_KEY` in the Expo development environment and pull it locally.

If every API call says `Network request failed`, check the configured API URL first:

- Android emulator should use `http://10.0.2.2:3003`.
- Physical Android should use the Vercel API or `http://<computer-lan-ip>:3003`.
- Physical Android also needs the API server to listen beyond `127.0.0.1`; bind it to the LAN interface or `0.0.0.0` for local debugging.

## Development APK
The app includes an EAS development profile for an installable Android APK:

```bash
npx eas-cli@latest build -p android --profile development
```

Install the downloaded APK:

```bash
adb install path/to/build.apk
```

Then start Metro for the dev client:

```bash
npm run android:dev-client
```

Production Play Store release is intentionally out of scope for now.
