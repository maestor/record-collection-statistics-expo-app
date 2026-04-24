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

