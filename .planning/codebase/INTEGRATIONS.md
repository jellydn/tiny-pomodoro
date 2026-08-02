# External Integrations

**Analysis Date:** 2026-08-03

## APIs & External Services

**Cloud Build / Distribution:**
- EAS Build (expo.dev) - Compiles APK/IPA in the cloud
- SDK/Client: `eas-cli` (global) invoked in CI and README
- Auth: `EXPO_TOKEN` (GitHub Actions secret); projectId `e3224d5e-56cf-4acd-bdd6-0f09947ab0fe`, owner `dunghd` in `app.config.ts`

**GitHub:**
- GitHub Actions - CI workflows (`.github/workflows/build-android.yml`, `build-ios.yml`)
- GitHub Releases - Artifact distribution (APK/IPA download + README QR code)
- Auth: `GITHUB_TOKEN`

**Misc:**
- api.qrserver.com - Static QR-code image in `README.md` pointing to latest release (client-side only, no API key)

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only (Expo assets: `PomodoroTimer/assets/`)

**Caching:**
- None

**Local persistence:**
- AsyncStorage - Timer state (`pomodoro_timer_state_v1`) and settings (`@pomodoro_settings`)
- iOS App Group `group.com.pomodorotimer.shared` - Shared `UserDefaults` suite between app and WidgetKit extension (see `utils/timerStorage.ts`, `PomodoroTimerWidget.swift`)
- No connection/ORM - JSON strings via AsyncStorage API

## Authentication & Identity

**Auth Provider:**
- None (client-only app, no user accounts)
- Implementation: N/A

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry/Bugsnag)

**Logs:**
- `console.error` in `contexts/SettingsContext.tsx`, `components/SoundPicker.tsx`; `console.log` in `plugins/ios-widget/withIOSWidget.js`; most storage/widget utilities silently swallow errors

## CI/CD & Deployment

**Hosting:**
- EAS Build (cloud) -> artifacts pulled and attached to GitHub Releases

**CI Pipeline:**
- GitHub Actions, two workflows:
  - `build-android.yml` - tag push `v*.*.*` or manual dispatch -> `eas build --platform android --profile development` -> APK -> GitHub Release
  - `build-ios.yml` - tag push or manual dispatch -> `eas build --platform ios --profile simulator` -> artifact -> GitHub Release

## Environment Configuration

**Required env vars:**
- `EXPO_TOKEN` (CI builds; from https://expo.dev/accounts/[username]/settings/access-tokens)
- `GITHUB_TOKEN` (auto-provided by GitHub Actions)

**Secrets location:**
- GitHub repository secrets; never in repo (`.env*.local`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` are gitignored)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None (notifications are local-only via `expo-notifications`; no push service configured)

---

*Integration audit: 2026-08-03*
