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
