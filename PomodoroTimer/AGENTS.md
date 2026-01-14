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

## Project Structure
- `App.tsx` - main app component
- `index.ts` - entry point
- `app.json` - Expo configuration
- `contexts/` - React Context providers (TimerContext, SettingsContext)
- `components/` - Reusable UI components (PresetButtons, CircularProgress, TimerControls, SettingsScreen, SettingsButton, SoundPicker, CompletionNotifier)

## Navigation
- Simple state-based navigation using `useState<Screen>` in App.tsx
- No external navigation library needed for this simple app
