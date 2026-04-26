# Versioning

Detailed agent workflow lives in `.agents/skills/versioning/SKILL.md`.

## Human Reference

- `package.json` is the single source of truth for the app version.
- `app.config.js` copies that value into Expo config so `expo.version` stays aligned.
- The versioning scripts also keep `app.json` and `package-lock.json` in sync.

Use the scripts instead of editing version numbers manually:

- `npm run version:auto`
- `npm run version:bump -- feature`
- `npm run version:bump -- fix`
- `npm run version:set -- <x.y.z>`

Major releases are always explicit in this project.
