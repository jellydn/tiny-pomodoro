# Coding Conventions

**Analysis Date:** 2026-08-03

## Naming Patterns

**Files:**
- Components/Widgets: PascalCase (`CircularProgress.tsx`, `SoundPicker.tsx`)
- Utils/Contexts/Storage: camelCase (`timerStorage.ts`, `widgetReload.ts`, `SettingsContext.tsx`)
- Platform-split: base name + `.ios.ts` / `.android.tsx` suffix (`androidWidget.ts`, `androidWidget.ios.ts`, `androidWidget.android.tsx`)
- Config plugin: kebab-case dir `plugins/ios-widget/`, camelCase file `withIOSWidget.js`

**Functions:**
- camelCase, verb-first for actions (`start`, `pause`, `stop`, `reset`, `setDuration`, `handleStartPause`, `loadSettings`, `saveSettings`)
- Event handlers prefixed `handle` (`handleStartPause`, `handleSelect`)
- Private/local helpers camelCase (`playTone`, `playWebAudioSound`, `updateWidget`, `persistState`)

**Variables:**
- camelCase; booleans prefixed `is`/`has`/`can` (`isRunning`, `isPaused`, `isCompleted`, `isHydrated`, `hasNotified`, `canDisableSound`)
- Constants SCREAMING_SNAKE_CASE (`DEFAULT_DURATION`, `TIMER_STATE_KEY`, `SETTINGS_STORAGE_KEY`, `AVAILABLE_SOUNDS`, `SIZE`, `STROKE_WIDTH`)
- Refs: `*Ref` suffix (`intervalRef`, `endTimeRef`, `scheduledNotificationRef`, `appStateRef`, `hasNotified`)

**Types:**
- PascalCase interfaces; `Props` suffix for component props (`TimerContextType`, `SettingsContextType`, `PersistedTimerState`, `SoundOption`, `PomodoroWidgetProps`, `SettingsScreenProps`)
- `type` for unions (`Screen = 'main' | 'settings'`)
- Export types alongside values when shared (`export type PersistedTimerState`)

## Code Style

**Formatting:**
- No Prettier config committed; code follows 2-space indent, single quotes, semicolons
- `StyleSheet.create` used for all styles (no inline `style` objects except dynamic/conditional props)

**Linting:**
- No ESLint config committed; TypeScript `strict: true` is the primary gate (`npx tsc --noEmit`)
- `cspell.json` + `cspell-tool.txt` for spelling; project dictionary is a committed txt file

## Import Organization

**Order:**
1. React/react-native builtins
2. Expo modules (`expo-*`)
3. Third-party (`@react-native-async-storage/async-storage`, `react-native-android-widget`, `react-native-svg`)
4. Relative project imports (contexts/utils/widgets/components) — consistently `../`-relative

**Path Aliases:**
- None (no `paths` in `tsconfig.json`); all imports are relative

## Error Handling

**Patterns:**
- Provider hooks throw descriptive errors: `useTimer must be used within a TimerProvider`, `useSettings must be used within a SettingsProvider` (`contexts/TimerContext.tsx`, `contexts/SettingsContext.tsx`)
- Async storage/settings ops wrapped in `try/catch` with `console.error` on failure
- Storage/widget helper paths use silent empty `catch {}` — failures degrade gracefully (timer state simply doesn't persist)
- Guard clauses for unsupported platforms: `if (Platform.OS === 'web') return;` (`TimerContext.tsx` notifications)

## Logging

**Framework:** `console`

**Patterns:**
- `console.error` for recoverable errors (settings load/save, sound preview)
- `console.log` in the config plugin to report copied files
- No debug logging in production code paths; no structured/leveled logging

## Comments

**When to Comment:**
- Sparingly; used mainly to explain *why* (e.g., "Platform-specific implementations in .android.ts and .ios.ts", "Prevent both being disabled", "Prevent both being disabled" in settings)
- Platform-split shells carry an explanatory comment instead of docs

**JSDoc/TSDoc:**
- Not used; interfaces are self-documenting with descriptive names

## Function Design

**Size:** Small-to-medium; components < 130 lines except `SoundPicker.tsx` (237) and `TimerContext.tsx` (309) which mix logic/UI. Widget Swift file is ~250 lines of declarative SwiftUI.

**Parameters:** Minimal; contexts pass single options objects where needed (`{ onBack }`, `{ onPress }`); platform shells use `_`-prefixed unused params

**Return Values:** Components return JSX or `null` (headless `CompletionNotifier`); hooks return typed context objects

## Module Design

**Exports:** Named exports for all components/functions/types (`export function X`, `export const X`, `export type X`); `App` is the sole default export (`App.tsx`)

**Barrel Files:** None (no `index.ts` barrels except root `index.ts` entry)

**Platform splitting:** Prefer `file.ts` + `file.ios.ts` + `file.android.tsx` over in-file `Platform.OS` branching where the implementation differs wholesale (widgets, androidWidget, bootstrap); in-file `Platform.OS` checks are used for small divergences (notifications, sound)

---

*Convention analysis: 2026-08-03*
