# Technology Stack

**Analysis Date:** 2026-08-03

## Languages

**Primary:**
- TypeScript ~5.9.2 - All app code under `PomodoroTimer/` (strict mode enabled)
- Swift (SwiftUI + WidgetKit) - iOS lock screen widget extension (`PomodoroTimer/plugins/ios-widget/PomodoroTimerWidget.swift`)

**Secondary:**
- JavaScript - Expo config plugin (`PomodoroTimer/plugins/ios-widget/withIOSWidget.js`)
- YAML - CI/CD workflows (`.github/workflows/build-*.yml`)
- Markdown - Docs (`PomodoroTimer/docs/adr/`, `tasks/`, `README.md`)

## Runtime

**Environment:**
- Node.js >= 20 (required, per README)
- React Native 0.81.5 with New Architecture enabled (`newArchEnabled: true` in `app.config.ts`)

**Package Manager:**
- Bun (recommended; used by README and CI workflows via `oven-sh/setup-bun@v1`)
- npm - fallback; `PomodoroTimer/package-lock.json` is committed
- Lockfile: present (`package-lock.json`); no `bun.lock` committed

## Frameworks

**Core:**
- Expo SDK ~54.0.31 - App framework, prebuild, EAS integration (`PomodoroTimer/package.json`)
- React 19.1.0 - UI library
- React Native 0.81.5 - Native runtime
- react-native-svg 15.12.1 - Circular progress ring (`components/CircularProgress.tsx`)
- react-native-android-widget ^0.20.0 - Android home screen widget
- WidgetKit / SwiftUI - Native iOS widget extension

**Testing:**
- None - no test framework configured (see `TESTING.md`)

**Build/Dev:**
- Expo CLI (`expo start`, `expo run:ios/android`) via `PomodoroTimer/package.json` scripts
- EAS CLI (eas-cli >= 5.0.0, `eas.json`) - Cloud builds
- TypeScript `tsc --noEmit` - Typechecking (documented in README)

## Key Dependencies

**Critical:**
- `@react-native-async-storage/async-storage` ^2.2.0 - Timer state + settings persistence
- `expo-notifications` ~0.32.16 - Completion notifications (local, scheduled)
- `react-native-android-widget` ^0.20.0 - Android widget rendering + task handler

**Infrastructure:**
- `expo-dev-client` ^6.0.20 - Development client builds
- `expo-status-bar` ~3.0.9 - Status bar
- `expo-system-ui` ^6.0.9 - System UI config
- `react-native-web` ^0.21.0 + `react-dom` 19.1.0 - Web target
- `expo-av` ~16.0.8 - Declared but **unused** in app code (see `CONCERNS.md`)

## Configuration

**Environment:**
- No `.env` files or runtime env vars in app code
- CI-only secret: `EXPO_TOKEN` (EAS auth) and `GITHUB_TOKEN` in `.github/workflows/`

**Build:**
- `PomodoroTimer/app.config.ts` - App name, slug, bundle IDs, plugins, EAS projectId (`e3224d5e-56cf-4acd-bdd6-0f09947ab0fe`, owner `dunghd`)
- `PomodoroTimer/eas.json` - Build profiles: `development`, `preview`, `simulator`, `production`; `appVersionSource: local`
- `PomodoroTimer/tsconfig.json` - extends `expo/tsconfig.base`, `strict: true`
- `cspell.json` + `cspell-tool.txt` - Spelling dictionary

## Platform Requirements

**Development:**
- Node.js >= 20, Bun or npm
- Xcode (iOS) with free Apple ID "Personal Team" signing for local device builds
- Android Studio / emulator for Android
- EAS CLI (`bun add -g eas-cli`)

**Production:**
- Built via EAS Build (cloud); artifacts distributed as GitHub Releases (APK + IPA)
- TestFlight/App Store/Play Store not yet configured (see `tasks/prd-cicd-testflight.md`)

---

*Stack analysis: 2026-08-03*
