# Architecture

**Analysis Date:** 2026-08-03

## Pattern Overview

**Overall:** Client-only React Native app (Expo) using Context-based state management, timestamp-based timer math for background reliability, and platform-split modules (`*.ios.ts` / `*.android.tsx`) to isolate native widget behavior.

**Key Characteristics:**
- Timer correctness does NOT depend on a running JS interval: an absolute `endTimestamp` is persisted, so remaining time is recomputed from wall-clock time on resume/hydration (`utils/timerStorage.ts` → `computeRemainingFromState`)
- Single source of truth for timer state: `TimerContext`, persisted as `PersistedTimerState` JSON, read by the app, the Android widget task handler, and the iOS WidgetKit extension (Swift `Codable` mirrors the same schema)
- No navigation library — a simple `useState<Screen>` switch in `App.tsx` toggles between main and settings screens
- Widgets: Android via `react-native-android-widget` (JS-rendered); iOS via a native WidgetKit extension preserved by an Expo config plugin

## Layers

**Presentation (components/):**
- Purpose: UI rendering + user interaction
- Location: `PomodoroTimer/components/`
- Contains: `CircularProgress.tsx`, `TimerControls.tsx`, `PresetButtons.tsx`, `SettingsScreen.tsx`, `SoundPicker.tsx`, `SettingsButton.tsx`, `CompletionNotifier.tsx` (headless)
- Depends on: `contexts/`, `react-native-svg`
- Used by: `App.tsx`

**State (contexts/):**
- Purpose: Central timer + settings state with persistence side effects
- Location: `PomodoroTimer/contexts/`
- Contains: `TimerContext.tsx` (309 lines — timer lifecycle, interval, AppState listener, notifications, widget sync), `SettingsContext.tsx` (sound/vibration preferences)
- Depends on: `utils/`, `expo-notifications`, AsyncStorage
- Used by: components, `App.tsx`

**Persistence (utils/timerStorage.ts):**
- Purpose: Save/load timer state; compute remaining from persisted timestamps
- Location: `PomodoroTimer/utils/timerStorage.ts`
- Contains: `PersistedTimerState` type, `saveTimerState`, `loadTimerState`, `computeRemainingFromState`, App Group key logic for iOS
- Used by: `TimerContext`, `widgetTaskHandler.android.tsx`, iOS Swift widget (schema parity)

**Widget Sync (utils/ + widgets/):**
- Purpose: Update home/lock screen widgets when state changes
- Location: `PomodoroTimer/utils/androidWidget.{ts,ios.ts,android.tsx}`, `utils/widgetReload.ts`, `widgets/widgetTaskHandler.{ts,ios.ts,android.tsx}`, `widgets/PomodoroWidget.{tsx,ios.tsx,android.tsx}`
- Contains: Platform no-op shells with real implementations per OS
- Depends on: `react-native-android-widget`, `utils/timerStorage.ts`

**Native Config (plugins/ios-widget/):**
- Purpose: Preserve the iOS widget extension across `expo prebuild`
- Location: `PomodoroTimer/plugins/ios-widget/withIOSWidget.js` + Swift/plist/entitlements files
- Used by: `app.config.ts` (registered as Expo plugin)

## Data Flow

**Start timer (foreground):**
1. `TimerControls.start()` → `TimerContext.start()`
2. Sets `endTimestamp = Date.now() + remaining * 1000`; `persistState(...)` writes AsyncStorage + updates widgets
3. `scheduleCompletionNotification(remaining)` schedules a local notification
4. A 1s `setInterval` decrements `remaining`, calling `updateWidget(...)` each tick (Android: `requestWidgetUpdate`)
5. At 0: clears interval, sets `isCompleted`, persists, `CompletionNotifier` fires sound/vibration

**Background/termination:**
1. `AppState` listener fires on return to foreground (`TimerContext.tsx` `useEffect`)
2. `newRemaining = max(0, ceil((endTimestamp - now)/1000))`; if <= 0 → completed
3. Cold start: hydration effect calls `loadTimerState()` → `computeRemainingFromState()`

**Android widget interaction:**
1. User taps Pause/Resume on home screen widget
2. `widgetTaskHandler.android.tsx` loads persisted state, computes remaining, writes new state (`saveTimerState`), re-renders widget
3. App picks up changes on next foreground/hydration

**State Management:**
- React Context (`TimerContext`, `SettingsContext`) — no Redux/Zustand
- All timer mutations flow through callbacks that persist + sync widgets

## Key Abstractions

**PersistedTimerState:**
- Purpose: The shared, persisted contract for timer state across app, Android widget, and iOS widget
- Examples: `PomodoroTimer/utils/timerStorage.ts` (TS), `PomodoroTimer/widgets/widgetTaskHandler.android.tsx` (consumes), `PomodoroTimer/plugins/ios-widget/PomodoroTimerWidget.swift` (Swift `Codable`)
- Pattern: Plain JSON object written to AsyncStorage / `UserDefaults`; Swift mirrors field names exactly

**Platform-Split Modules:**
- Purpose: One import name, per-OS implementation resolved by Metro bundler
- Examples: `utils/androidWidget.ts` (fallback) → `.ios.ts` (no-op) / `.android.tsx` (real); `widgets/PomodoroWidget.tsx` → `.ios.tsx` (null) / `.android.tsx` (real); `bootstrap.ts` → `.android.ts` (registers widget handler)
- Pattern: `file.ts` shell + `file.ios.ts` + `file.android.tsx`

**Expo Config Plugin (withIOSWidget):**
- Purpose: Re-inject widget sources and App Group entitlement into generated iOS project
- Examples: `plugins/ios-widget/withIOSWidget.js`, ADR `PomodoroTimer/docs/adr/001-ios-widget-expo-plugin.md`
- Pattern: `withEntitlementsPlist` + `withDangerousMod` file copy

## Entry Points

**App bootstrap:**
- Location: `PomodoroTimer/index.ts`
- Triggers: `registerRootComponent(App)`; imports `./bootstrap`
- Responsibilities: Root registration

**Platform bootstrap:**
- Location: `PomodoroTimer/bootstrap.android.ts` (registerWidgetTaskHandler), `.ios.ts` (no-op), `bootstrap.ts` (shell)
- Triggers: Module import at startup

**App root:**
- Location: `PomodoroTimer/App.tsx`
- Responsibilities: Compose `SettingsProvider` → `TimerProvider` → `CompletionNotifier` → `AppNavigator` (main/settings switch)

**iOS Widget:**
- Location: `PomodoroTimerWidget.swift` `@main struct PomodoroTimerWidget`
- Triggers: WidgetKit timeline requests (`getSnapshot`, `getTimeline`)
- Responsibilities: Read shared UserDefaults, render progress ring + time + Pause/Resume label

## Error Handling

**Strategy:** Swallow-and-continue in storage/widget paths; log-and-continue in settings/sound paths; throw only for missing provider context.

**Patterns:**
- Empty `catch {}` in `utils/timerStorage.ts` (save/load silently no-op on failure) and `utils/widgetReload.ts`
- `try/catch` with `console.error` in `contexts/SettingsContext.tsx`, `components/SoundPicker.tsx`
- `throw new Error('useTimer must be used within a TimerProvider')` / `useSettings` guard in both contexts
- No React error boundaries; no crash reporting

## Cross-Cutting Concerns

**Logging:** `console.error` (settings, sound preview), `console.log` (config plugin file copies); no structured logging

**Validation:** Minimal; guarded provider hooks; `remaining <= 0` start guard in `TimerContext`; settings enforce at-least-one-notification rule

**Authentication:** None (no backend)

---

*Architecture analysis: 2026-08-03*
