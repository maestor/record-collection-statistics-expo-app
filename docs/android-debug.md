# Android Debug

## Expo Go First
Start Metro:

```bash
npm start
```

Open the project in Expo Go. Set the API base URL in Settings:

- Android emulator: `http://10.0.2.2:3003`
- Physical Android device: `http://<computer-lan-ip>:3003`

For physical devices, the phone and API host computer must be on the same network. If the API requires non-local auth, configure the read API key in Settings.

If every API call says `Network request failed`, check the app Settings first:

- Android emulator should use `http://10.0.2.2:3003`.
- Physical Android should use `http://<computer-lan-ip>:3003`.
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
