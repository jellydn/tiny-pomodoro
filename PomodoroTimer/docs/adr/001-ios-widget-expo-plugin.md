# ADR-001: iOS Widget Preservation via Expo Config Plugin

## Status

Accepted

## Context

The app uses a custom iOS WidgetKit extension (`PomodoroTimerWidget`) written in SwiftUI for lock screen widgets. Expo's `prebuild` command regenerates the entire `ios/` directory, which deletes any custom native code including our widget extension.

This became an issue when running:
```bash
npx expo prebuild --platform ios --clean
```

The widget files were lost and had to be manually recreated each time.

## Decision

Create an Expo config plugin that:

1. **Stores widget source files** in `plugins/ios-widget/` (version controlled)
2. **Automatically copies** these files to `ios/PomodoroTimerWidget/` during prebuild
3. **Adds App Group entitlement** to the main app for shared UserDefaults

### Plugin Structure

```
plugins/ios-widget/
├── withIOSWidget.js          # Expo config plugin
├── PomodoroTimerWidget.swift # Widget SwiftUI code
├── Info.plist                # Widget bundle info
└── PomodoroTimerWidget.entitlements  # App Group config
```

### How It Works

1. The plugin hooks into Expo's `withDangerousMod` for iOS
2. After native code generation, it copies widget files to `ios/PomodoroTimerWidget/`
3. The `withEntitlementsPlist` modifier adds the App Group to the main app

### Manual Step Required

After first prebuild, you must add the widget target in Xcode once:

1. Open `ios/*.xcworkspace`
2. File → New → Target → Widget Extension
3. Name it `PomodoroTimerWidget`
4. Replace the generated Swift file with ours
5. Add App Group: `group.com.pomodorotimer.shared` to both targets

Subsequent prebuilds will preserve the widget files automatically.

## Consequences

### Positive

- Widget source code is version controlled and survives `prebuild --clean`
- App Group entitlement is automatically configured
- Clear separation between plugin (source of truth) and generated code

### Negative

- Initial Xcode setup still required (one-time manual step)
- Must remember to update files in `plugins/ios-widget/` when modifying widget

### Alternatives Considered

1. **Avoid `--clean` flag**: Fragile, leads to stale native code issues
2. **Full Xcode project manipulation**: Too complex, xcode project files are brittle
3. **Third-party widget libraries**: None support WidgetKit with SwiftUI adequately

## References

- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Groups for Data Sharing](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
