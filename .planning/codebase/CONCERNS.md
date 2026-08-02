# Codebase Concerns

**Analysis Date:** 2026-08-03

## Tech Debt

**iOS widget timeline reload is a no-op (dead code):**
- Issue: `utils/widgetReload.ts` augments `react-native`'s `NativeModules` with a `WidgetCenter` module and calls `reloadAllTimelines()`, but **no native `WidgetCenter` module is registered anywhere in the repo** (Swift file is a WidgetKit extension, not a native module). The guard `if (NativeModules.WidgetCenter)` means the call silently does nothing.
- Files: `PomodoroTimer/utils/widgetReload.ts`, `PomodoroTimer/contexts/TimerContext.tsx` (line ~35 `reloadWidgetTimelines()`)
- Impact: iOS widget updates rely solely on the 60-entry timeline (max 60s); pause/resume/duration changes may show stale state on the lock screen for up to a minute. Android is unaffected (uses `requestWidgetUpdate`).
- Fix approach: Implement a real native module (e.g., `WidgetCenter` RCT module in the app target that calls `WidgetCenter.shared.reloadAllTimelines()`), or remove the dead path and document the timeline-only behavior.

**iOS widget source duplicated in two locations:**
- Issue: `PomodoroTimer/plugins/ios-widget/PomodoroTimerWidget.swift` (plugin source of truth) and committed `PomodoroTimer/ios/PomodoroTimerWidget/PomodoroTimerWidget.swift` are identical copies; likewise `Info.plist`/entitlements.
- Files: `PomodoroTimer/plugins/ios-widget/*`, `PomodoroTimer/ios/PomodoroTimerWidget/*` (and top-level `ios/PomodoroTimerWidget/*`)
- Impact: Drift risk — edits in one place silently diverge; ADR-001 explicitly warns "must remember to update files in plugins/ios-widget/".
- Fix approach: Decide single source of truth; either gitignore the generated `ios/` copy (rely on plugin) or drop the plugin copy step and commit only one.

**CI workflow/PRD mismatch:**
- Issue: `build-android.yml` builds `--profile development` (a dev-client debug build) while `tasks/prd-cicd-testflight.md` specifies `preview` profile for distributable APKs. `eas.json` `preview` profile also still has `developmentClient: true`.
- Files: `.github/workflows/build-android.yml`, `PomodoroTimer/eas.json`, `tasks/prd-cicd-testflight.md`
- Impact: "Download APK" release artifact may be a dev-client build, not a standalone APK; PRD's preview profile is unused.
- Fix approach: Switch workflow to `--profile preview` and set `developmentClient: false` for preview (or remove the profile entirely).

**iOS CI builds simulator artifact, ships as "IPA":**
- Issue: `build-ios.yml` runs `eas build --platform ios --profile simulator`, which produces a simulator `.app`/`.tar.gz` — not a device-installable `.ipa` — yet the workflow names the file `.ipa` and the release body advertises AltStore/Sideloadly sideloading.
- Files: `.github/workflows/build-ios.yml`
- Impact: Misleading release artifacts; users cannot sideload the "IPA".
- Fix approach: Build with a proper device profile (needs Apple Developer account) or clearly label simulator-only artifacts.

**Near-duplicate code:**
- `stop` and `reset` in `TimerContext.tsx` are identical; the `SOUND_FREQUENCIES` map is defined twice with different values (`components/SoundPicker.tsx` vs `components/CompletionNotifier.tsx` — e.g. bell 880 vs 800), so sound selection behaves differently in preview vs completion.
- Files: `PomodoroTimer/contexts/TimerContext.tsx`, `PomodoroTimer/components/SoundPicker.tsx`, `PomodoroTimer/components/CompletionNotifier.tsx`
- Fix approach: Collapse `stop`/`reset`; extract a single shared sound-constants module.

**`stop`/`reset`/`setDuration` side-effect duplication:** each manually resets 4+ state fields and persists — a single `applyState` reducer would remove drift risk.

## Known Bugs

**Selected sound not used for native completion notification:**
- Symptoms: Choosing a sound in Settings only affects the Web Audio preview; on iOS/Android the completion notification plays the default notification sound (trigger `sound: true` in `scheduleCompletionNotification`).
- Files: `PomodoroTimer/contexts/TimerContext.tsx` (notification trigger), `PomodoroTimer/components/CompletionNotifier.tsx` (web-only audio)
- Trigger: Set sound → start timer → wait for completion on a device
- Workaround: None (settings sound is web-only)
- Fix approach: Pass the selected sound into the notification content, or play a native sound via `expo-av` on completion.

**Notification permissions never requested up front:**
- Symptoms: If notifications are denied, timer completion relies on `CompletionNotifier` (sound/vibration), which on native only vibrates — no audible alert.
- Files: `PomodoroTimer/contexts/TimerContext.tsx` (`scheduleCompletionNotification` returns early when denied)
- Trigger: User denies notification permission
- Workaround: `CompletionNotifier` vibration still fires
- Fix approach: Request permission on first Start, or use `expo-av` for completion sound.

**Android widget Pause/Resume vs running app state race:**
- Symptoms: Pausing/resuming from the widget updates storage, but a foregrounded app's `isRunning` state isn't refreshed until an AppState change or restart; a running JS interval can keep ticking against the widget's new state.
- Files: `PomodoroTimer/widgets/widgetTaskHandler.android.tsx`, `PomodoroTimer/contexts/TimerContext.tsx`
- Trigger: App in background → tap Pause in widget → return to app
- Workaround: App recomputes from `endTimestamp` on next AppState change
- Fix approach: Broadcast intent/event from widget handler to app, or re-hydrate on every AppState `active`.

**`remaining <= 0` widget state:** when a stored state is `isCompleted` with `remaining: 0`, `computeRemainingFromState` returns `isCompleted: true` but `widgetTaskHandler` shows "Resume" button with `00:00` — starting would return early in the app (`if (remaining <= 0) return;`) but the widget still offers Resume.

## Security Considerations

**Client-only app — low surface:**
- Risk: None identified in app code; no backend, no user data, no keys shipped.
- Files: `PomodoroTimer/` (all)
- Current mitigation: `EXPO_TOKEN`/`GITHUB_TOKEN` live in GitHub secrets; secrets-bearing file types gitignored (`*.jks`, `*.p8`, `*.p12`, `*.key`, `.env*.local`)
- Recommendations: Ensure the config plugin doesn't print paths/secrets (it only logs filenames — fine); keep `expo-dev-client` out of production builds.

## Performance Bottlenecks

**Android widget re-rendered every second:**
- Problem: `TimerContext` interval calls `updateWidget(next, duration, true)` → `requestWidgetUpdate` once per second while running.
- Files: `PomodoroTimer/contexts/TimerContext.tsx`, `PomodoroTimer/utils/androidWidget.android.tsx`
- Cause: Widget shows countdown; naive per-tick update.
- Improvement path: Update only on state transitions (start/pause/stop) and let the widget render its own countdown (Android widgets support `updatePeriodMillis`/clock-based ticks), or throttle to every 30–60s.

## Fragile Areas

**iOS widget target requires manual Xcode step:**
- Files: `PomodoroTimer/plugins/ios-widget/withIOSWidget.js`, ADR `PomodoroTimer/docs/adr/001-ios-widget-expo-plugin.md`
- Why fragile: The config plugin only copies files + adds entitlements; the Xcode widget *target* must be added by hand once, and the whole generated `ios/` dir is gitignored (`/ios/*`), so a fresh clone → prebuild → widget target is missing until re-added manually.
- Safe modification: Keep plugin + ADR in sync; document the one-time step in README (ADR already does).
- Test coverage: None.

**Platform-split file pairs:**
- Files: `utils/androidWidget.{ts,ios.ts,android.tsx}`, `widgets/PomodoroWidget.{tsx,ios.tsx,android.tsx}`, `widgets/widgetTaskHandler.{ts,ios.ts,android.tsx}`, `bootstrap.{ts,ios.ts,android.ts}` (plus `.ios.ts` variants of `.tsx`)
- Why fragile: Metro resolves per-platform at build time; forgetting one variant or mismatched prop types breaks only one platform, often silently (no tests).
- Safe modification: Keep shells consistent (`export type` + same signatures); typecheck with `tsc --noEmit` catches mismatch.
- Test coverage: None.

## Scaling Limits

**State persistence single-key JSON:**
- Current capacity: One JSON blob per key (`pomodoro_timer_state_v1`, `@pomodoro_settings`); fine at this scale.
- Limit: No history/stats; any schema change requires a new key or migration (`_v1` suffix hints at intent, but no migration logic exists).
- Scaling path: Add versioned migrations in `timerStorage.ts` if fields evolve.

## Dependencies at Risk

**`expo-av` (~16.0.8) — unused:**
- Risk: Declared in `package.json` but not imported anywhere; adds bundle weight.
- Impact: None today.
- Migration plan: Remove from `dependencies` (re-add if native completion sounds are implemented).

**Lockfile mismatch:**
- Risk: `package-lock.json` (npm) is committed but README/CI use Bun; no `bun.lock` committed → non-reproducible installs across contributors.
- Impact: Dependency resolution drift.
- Migration plan: Commit `bun.lock` and drop `package-lock.json`, or standardize on npm.

**`eas.json` `preview` misconfigured vs PRD** (see Tech Debt) — risk of shipping dev-client builds as releases.

## Missing Critical Features

**No test infrastructure:**
- Problem: Zero tests, no runner configured.
- Blocks: Safe refactors of `TimerContext` (309 lines), confident CI gating, regression detection for timer math.
- Priority: High

**No error reporting/analytics:**
- Problem: Silent `catch {}` paths and `console.error` only.
- Blocks: Diagnosing device-only widget/storage issues.
- Priority: Low

**No sound on native completion:**
- Problem: Selected sound + audible completion depends on notification permission; denied permission = silent completion (vibration only).
- Blocks: Core UX promise ("Sound & vibration notifications" in README).
- Priority: Medium

## Test Coverage Gaps

**`computeRemainingFromState` / timer math:**
- What's not tested: All branch logic (running with endTimestamp, expired, paused, completed).
- Files: `PomodoroTimer/utils/timerStorage.ts`
- Risk: Off-by-one drift in background completion — the app's core value proposition.
- Priority: High

**TimerContext lifecycle:**
- What's not tested: start/pause/stop/reset transitions, AppState recompute, notification scheduling.
- Files: `PomodoroTimer/contexts/TimerContext.tsx`
- Risk: State desync with widgets/notifications.
- Priority: High

**Widget handlers:**
- What's not tested: `widgetTaskHandler.android.tsx` PAUSE/RESUME, `PomodoroWidget.android.tsx` rendering (progress math duplicated from `CircularProgress.tsx`).
- Files: `PomodoroTimer/widgets/*`
- Risk: Widget/app progress mismatch; progress math drift (two copies).
- Priority: Medium

**Config plugin:**
- What's not tested: `withIOSWidget.js` file copy + entitlement injection.
- Files: `PomodoroTimer/plugins/ios-widget/withIOSWidget.js`
- Risk: Prebuild silently loses widget sources.
- Priority: Medium

---

*Concerns audit: 2026-08-03*
