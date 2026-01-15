# 🍅 tiny-pomodoro

A simple, fast Pomodoro timer app with presets, background operation, and lock screen widgets.

## Features

- ⏱️ Quick preset buttons: 25, 30, 45, 50 minutes
- 🎯 Circular progress indicator
- 🔔 Sound & vibration notifications
- 📱 Background timer operation
- 🔒 Lock screen widgets (iOS & Android)

## Download

### Android

[![Download APK](https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android)](https://github.com/jellydn/tiny-pomodoro/releases/latest)

**Scan QR code to download:**

![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://github.com/jellydn/tiny-pomodoro/releases/latest)

**Installation:**
1. Download the APK from [Releases](../../releases/latest)
2. On your Android device, go to Settings → Security
3. Enable "Install from unknown sources"
4. Open the downloaded APK to install

### iOS

iOS requires building locally with Xcode (free Apple ID works):

1. Clone this repository
2. `cd PomodoroTimer`
3. Run `npx expo prebuild --platform ios`
4. Open `ios/PomodoroTimer.xcworkspace` in Xcode
5. Select your iPhone as the target device
6. In Signing & Capabilities, select your Apple ID as "Personal Team"
7. Press ⌘R to build and run

> ⚠️ Free certificates expire after 7 days - reinstall when expired

## Development

### Prerequisites

- Node.js 20+
- Bun (recommended) or npm
- EAS CLI (`bun add -g eas-cli`)
- Xcode (for iOS)

### Commands

```bash
cd PomodoroTimer

# Install dependencies
bun install

# Start development server
bun run start

# Run on iOS simulator
bun run ios

# Run on Android emulator
bun run android

# Run on web
bun run web

# Typecheck
npx tsc --noEmit
```

## Releasing a New Version

### Automatic (via GitHub Actions)

1. Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. GitHub Actions will build the APK and create a release automatically

### Manual Build

```bash
# Build Android APK
npx eas build --platform android --profile preview

# Build for production (requires accounts)
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

## Setup for CI/CD

1. **EAS Account**: Run `eas login` and authenticate
2. **GitHub Secret**: Add `EXPO_TOKEN` to repository secrets
   - Get token from: https://expo.dev/accounts/[username]/settings/access-tokens
3. **Update QR Code**: Replace the QR code URL in this README with your actual releases URL

## License

MIT
