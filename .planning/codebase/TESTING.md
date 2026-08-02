# Testing Patterns

**Analysis Date:** 2026-08-03

## Test Framework

**Runner:**
- None configured. No Jest, Vitest, Detox, or Maestro setup; no `test` script in `PomodoroTimer/package.json`
- Config: N/A

**Assertion Library:**
- None

**Run Commands:**
```bash
npx tsc --noEmit        # Typecheck (strict) — the only automated check
```

## Test File Organization

**Location:**
- No test files exist (search for `*.test.*` / `*.spec.*` returns nothing)

**Naming:**
- N/A

**Structure:**
- N/A

## Test Structure

**Suite Organization:**
- N/A — verification is currently manual:
  - README documents run commands (`bun run ios` / `android` / `web`) for manual QA
  - `scripts/ralph/prompt-amp.md` / `prompt-opencode.md` instruct the agent to verify UI in browser and preserve learnings in AGENTS.md

**Patterns:**
- Manual only

## Mocking

**Framework:** None

**Patterns:**
- N/A

**What to Mock:**
- N/A

**What NOT to Mock:**
- N/A

## Fixtures and Factories

**Test Data:**
- Only hardcoded defaults in source: `DEFAULT_DURATION = 25 * 60` (`TimerContext.tsx`, `widgetTaskHandler.android.tsx`), `DEFAULT_SETTINGS` (`SettingsContext.tsx`), placeholder widget entry `1500s` (`PomodoroTimerWidget.swift`)

**Location:**
- Inline constants only

## Coverage

**Requirements:** None enforced (no coverage tooling)

**View Coverage:**
- N/A

## Test Types

**Unit Tests:**
- Not used

**Integration Tests:**
- Not used

**E2E Tests:**
- Not used (no Detox/Maestro)

## Common Patterns

**Async Testing:**
- N/A

**Error Testing:**
- N/A

## Highest-Value Candidates (if tests are added)

- `computeRemainingFromState` (`utils/timerStorage.ts`) — pure function, ideal first unit test
- `TimerContext` reducer-like transitions (start/pause/stop/reset) — needs React Testing Library + mocked `expo-notifications`
- `widgetTaskHandler.android.tsx` PAUSE/RESUME state transitions with mocked storage
- `CircularProgress`/`PomodoroWidget.android.tsx` rendering — snapshot/rendering tests with react-test-renderer

---

*Testing analysis: 2026-08-03*
