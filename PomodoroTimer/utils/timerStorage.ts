import AsyncStorage from '@react-native-async-storage/async-storage';

export const TIMER_STATE_KEY = 'pomodoro_timer_state_v1';

export type PersistedTimerState = {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  endTimestamp: number | null;
  updatedAt: number;
};

export async function saveTimerState(state: PersistedTimerState): Promise<void> {
  try {
    await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch {
    // Swallow errors for now
  }
}

export async function loadTimerState(): Promise<PersistedTimerState | null> {
  try {
    const raw = await AsyncStorage.getItem(TIMER_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedTimerState;
  } catch {
    return null;
  }
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
