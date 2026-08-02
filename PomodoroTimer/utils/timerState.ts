// Single source of truth for the persisted timer-state contract.
//
// This module is intentionally free of I/O and platform imports: it defines
// the schema, the storage keys, and the pure time math so that every consumer
// (app, Android widget handler, iOS WidgetKit extension) mirrors one contract
// instead of hand-copied copies.

export const TIMER_STATE_KEY = 'pomodoro_timer_state_v1';
export const APP_GROUP_ID = 'group.com.pomodorotimer.shared';
export const DEFAULT_DURATION = 25 * 60;

export type PersistedTimerState = {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  endTimestamp: number | null;
  updatedAt: number;
};

export function serializeTimerState(state: PersistedTimerState): string {
  return JSON.stringify(state);
}

export function deserializeTimerState(raw: string): PersistedTimerState {
  return JSON.parse(raw) as PersistedTimerState;
}

export function computeRemainingFromState(state: PersistedTimerState): {
  remaining: number;
  isRunning: boolean;
  isCompleted: boolean;
  endTimestamp: number | null;
} {
  if (state.isRunning && state.endTimestamp) {
    const now = Date.now();
    const newRemaining = Math.max(0, Math.ceil((state.endTimestamp - now) / 1000));

    if (newRemaining <= 0) {
      return {
        remaining: 0,
        isRunning: false,
        isCompleted: true,
        endTimestamp: null,
      };
    }

    return {
      remaining: newRemaining,
      isRunning: true,
      isCompleted: false,
      endTimestamp: state.endTimestamp,
    };
  }

  return {
    remaining: state.remaining,
    isRunning: state.isRunning,
    isCompleted: state.isCompleted,
    endTimestamp: state.endTimestamp,
  };
}
