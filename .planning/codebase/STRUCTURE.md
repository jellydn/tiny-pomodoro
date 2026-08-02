# Codebase Structure

**Analysis Date:** 2026-08-03

## Directory Layout

```
tiny-pomodoro/
├── PomodoroTimer/            # Expo app root (package.json, tsconfig, app.config.ts)
│   ├── App.tsx               # Root component + main/settings screen switch
│   ├── index.ts              # registerRootComponent + bootstrap import
│   ├── bootstrap.ts          # Platform-split bootstrap shell (.ios.ts/.android.ts)
│   ├── components/           # UI: CircularProgress, TimerControls, PresetButtons, Settings*, SoundPicker, CompletionNotifier
│   ├── contexts/             # TimerContext (timer engine) + SettingsContext
│   ├── utils/                # timerStorage, androidWidget (platform-split), widgetReload
│   ├── widgets/              # Android widget UI + task handler; iOS stubs
│   ├── plugins/ios-widget/   # Expo config plugin + Swift widget sources (source of truth)
│   ├── docs/adr/             # Architecture decision records
│   ├── assets/               # App icons + splash (png + svg)
│   └── ios/PomodoroTimerWidget/  # Generated/copied widget dir (gitignored-except)
├── ios/PomodoroTimerWidget/  # Mirrored copy of widget sources (see CONCERNS.md)
├── .github/workflows/        # build-android.yml, build-ios.yml (EAS + GitHub Releases)
├── tasks/                    # PRD: CI/CD + TestFlight
├── scripts/ralph/            # Ralph agent workflow tooling (progress, PRDs)
├── docs/                     # (empty of app docs; ADRs live under PomodoroTimer/docs)
├── cspell.json               # Spelling config + cspell-tool.txt dictionary
└── README.md                 # Project docs, install/release instructions
```

## Directory Purposes

**PomodoroTimer/components:**
- Purpose: Presentational React components
- Contains: All UI including modal (`SoundPicker`), headless notifier (`CompletionNotifier`)
- Key files: `CircularProgress.tsx`, `TimerControls.tsx`, `SettingsScreen.tsx`

**PomodoroTimer/contexts:**
- Purpose: Global state providers
- Contains: `TimerContext.tsx` (largest file, 309 lines), `SettingsContext.tsx`
- Key files: `TimerContext.tsx`

**PomodoroTimer/utils:**
- Purpose: Persistence + widget sync helpers
- Contains: `timerStorage.ts`, `androidWidget.ts` (+ `.ios.ts`/`.android.tsx`), `widgetReload.ts`
- Key files: `timerStorage.ts` (shared schema)

**PomodoroTimer/widgets:**
- Purpose: Android home screen widget (JSX via `react-native-android-widget`) and its background task handler; iOS placeholders
- Contains: `PomodoroWidget.android.tsx`, `widgetTaskHandler.android.tsx`, plus `.tsx`/`.ios.ts` no-op shells
- Key files: `PomodoroWidget.android.tsx`, `widgetTaskHandler.android.tsx`

**PomodoroTimer/plugins/ios-widget:**
- Purpose: Version-controlled source of the iOS WidgetKit extension + config plugin
- Contains: `withIOSWidget.js`, `PomodoroTimerWidget.swift`, `Info.plist`, `PomodoroTimerWidget.entitlements`
- Key files: `withIOSWidget.js`

**PomodoroTimer/docs/adr:**
- Purpose: Architecture decision records
- Contains: `001-ios-widget-expo-plugin.md`

## Key File Locations

**Entry Points:**
- `PomodoroTimer/index.ts`: Root registration
- `PomodoroTimer/bootstrap.android.ts`: Widget task handler registration
- `PomodoroTimerWidget.swift`: iOS WidgetKit `@main`

**Configuration:**
- `PomodoroTimer/app.config.ts`: Expo config + plugins + EAS projectId
- `PomodoroTimer/eas.json`: Build profiles (`development`, `preview`, `simulator`, `production`)
- `PomodoroTimer/tsconfig.json`: Strict TS
- `cspell.json`: Spelling

**Core Logic:**
- `PomodoroTimer/contexts/TimerContext.tsx`: Timer engine
- `PomodoroTimer/utils/timerStorage.ts`: Persistence + time math
- `PomodoroTimer/widgets/widgetTaskHandler.android.tsx`: Widget-side timer control

**Testing:**
- None (no test directory or files — see `TESTING.md`)

## Naming Conventions

**Files:**
- Platform-split suffix: `androidWidget.ts` / `androidWidget.ios.ts` / `androidWidget.android.tsx`; `PomodoroWidget.tsx` / `.ios.tsx` / `.android.tsx`
- PascalCase for components (`CircularProgress.tsx`); camelCase for utilities (`timerStorage.ts`, `widgetReload.ts`)
- `.js` for the config plugin (`withIOSWidget.js`)

**Directories:**
- Feature-ish grouping: `components/`, `contexts/`, `utils/`, `widgets/`, `plugins/`

## Where to Add New Code

**New Feature:**
- Primary code: `PomodoroTimer/components/` (UI) + `PomodoroTimer/contexts/` (state) following the existing pattern
- Tests: no test infrastructure exists yet

**New Component/Module:**
- Implementation: `PomodoroTimer/components/`; if platform-specific, use the `.ios.ts`/`.android.tsx` split with a `.ts`/`.tsx` shell

**Utilities:**
- Shared helpers: `PomodoroTimer/utils/`

## Special Directories

**PomodoroTimer/ios/:**
- Purpose: Generated native iOS project (`expo prebuild`)
- Generated: Yes
- Committed: No — `/ios/*` gitignored, EXCEPT `/ios/PomodoroTimerWidget` (`PomodoroTimer/.gitignore`)

**PomodoroTimer/ios/PomodoroTimerWidget/:**
- Purpose: Widget extension directory (copied from `plugins/ios-widget/` by the config plugin; also committed)
- Generated: Yes (via plugin) but also tracked in git
- Committed: Yes

**PomodoroTimer/android/:**
- Purpose: Generated native Android project
- Generated: Yes
- Committed: No (gitignored)

**PomodoroTimer/assets/:**
- Purpose: Icons + splash images (png + svg source)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-08-03*
