// Pure session engine for the Pomodoro timer.
//
// This module owns ALL timer state transitions so the app's TimerContext and
// the Android widget task handler drive one engine instead of hand-writing
// start/pause/stop/reset in two places. It has no I/O and no React imports —
// side effects (persistence, notifications, widget sync) live in the callers.

export interface SessionState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  endTimestamp: number | null;
}

export type SessionAction =
  | { type: 'setDuration'; duration: number }
  | { type: 'start'; now: number }
  | { type: 'pause' }
  | { type: 'stop' }
  | { type: 'reset' }
  // One-second interval tick.
  | { type: 'tick'; now: number }
  // Recompute remaining from the persisted endTimestamp (foreground/hydration).
  | { type: 'reconcile'; now: number };

export function createSession(duration: number): SessionState {
  return {
    duration,
    remaining: duration,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    endTimestamp: null,
  };
}

export function reduceSession(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'setDuration':
      return createSession(action.duration);

    case 'start': {
      if (state.remaining <= 0 || state.isRunning) return state;
      return {
        ...state,
        isRunning: true,
        isPaused: false,
        isCompleted: false,
        endTimestamp: action.now + state.remaining * 1000,
      };
    }

    case 'pause':
      return {
        ...state,
        isRunning: false,
        isPaused: true,
        endTimestamp: null,
      };

    case 'stop':
    case 'reset':
      return createSession(state.duration);

    case 'tick': {
      if (!state.isRunning || state.remaining <= 0) return state;
      const remaining = state.remaining - 1;
      if (remaining <= 0) {
        return {
          ...state,
          remaining: 0,
          isRunning: false,
          isPaused: false,
          isCompleted: true,
          endTimestamp: null,
        };
      }
      return {
        ...state,
        remaining,
        endTimestamp: action.now + remaining * 1000,
      };
    }

    case 'reconcile': {
      if (!state.isRunning || !state.endTimestamp) return state;
      const remaining = Math.max(0, Math.ceil((state.endTimestamp - action.now) / 1000));
      if (remaining <= 0) {
        return {
          ...state,
          remaining: 0,
          isRunning: false,
          isPaused: false,
          isCompleted: true,
          endTimestamp: null,
        };
      }
      return { ...state, remaining };
    }
  }
}
