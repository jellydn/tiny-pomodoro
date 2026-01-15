# PomodoroTimer AGENTS.md

## Commands
- **Typecheck**: `npx tsc --noEmit`
- **Start dev server (web)**: `npm run web`
- **Start dev server (iOS)**: `npm run ios`
- **Start dev server (Android)**: `npm run android`

## Framework
- Built with Expo (React Native framework)
- TypeScript is enabled by default

## Key Dependencies
- `@react-native-async-storage/async-storage` - for persistent settings storage
- `react-native-svg` - for circular progress indicator
- `expo-status-bar` - for status bar styling
- `expo-av` - for audio playback (sound notifications)
- `expo-notifications` - for background/scheduled notifications

## Project Structure
- `App.tsx` - main app component
- `index.ts` - entry point
- `app.json` - Expo configuration
- `contexts/` - React Context providers (TimerContext, SettingsContext)
- `components/` - Reusable UI components (PresetButtons, CircularProgress, TimerControls, SettingsScreen, SettingsButton, SoundPicker, CompletionNotifier)

## Navigation
- Simple state-based navigation using `useState<Screen>` in App.tsx
- No external navigation library needed for this simple app

## Android Widget
- Uses `react-native-android-widget` library for home screen widgets
- Widget files: `widgets/PomodoroWidget.tsx` (UI) and `widgets/widgetTaskHandler.tsx` (logic)
- Register widget in `index.ts` using `registerWidgetTaskHandler()`
- Widget props: `remainingSeconds`, `durationSeconds`, `isRunning`
- Use `clickAction` prop on FlexWidget for button interactions (e.g., `clickAction="PAUSE"`)
- Update widget from app using `requestWidgetUpdate()` from `react-native-android-widget`
- Widget state stored in AsyncStorage (`timerStorage.ts`) for cross-process access
- Type fix: Use `widgetInfo.widgetName` in widgetTaskHandler (not direct `widgetName` property)

## Local iOS Build (Free - No Apple Developer Account)
1. Generate native iOS project: `npx expo prebuild --platform ios`
2. Open in Xcode: `open ios/PomodoroTimer.xcworkspace`
3. In Xcode: Select your iPhone as target device
4. In Signing & Capabilities: Select your free Apple ID as "Personal Team"
5. Click Run (⌘R) to build and install on connected iPhone
6. **Note:** Free certificates expire after 7 days - reinstall when expired

## iOS Widget
- Uses WidgetKit with SwiftUI for lock screen widgets
- Widget extension location: `ios/PomodoroTimerWidget/` directory
- Main files: `PomodoroTimerWidget.swift` (widget bundle, provider, and SwiftUI view)
- Uses App Group `group.com.pomodorotimer.shared` for shared state between app and widget
- Update timer storage with App Group prefix for iOS: `${APP_GROUP_ID}:${TIMER_STATE_KEY}`
- Widget displays remaining time with circular progress indicator
- Widget supports pause/resume via button tap
- Widget updates in real-time using timeline provider
- Reload widget timelines from app using `NativeModules.WidgetCenter.reloadAllTimelines()`
- Widget configuration:
  - Display name: "Pomodoro Timer"
  - Description: "View and control your Pomodoro timer from the lock screen."
  - Supported families: `.systemSmall`, `.systemMedium`
