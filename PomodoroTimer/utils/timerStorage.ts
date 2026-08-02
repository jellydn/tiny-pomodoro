import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import {
  APP_GROUP_ID,
  TIMER_STATE_KEY,
  serializeTimerState,
  deserializeTimerState,
  computeRemainingFromState,
  DEFAULT_DURATION,
  type PersistedTimerState,
} from './timerState';

export {
  APP_GROUP_ID,
  TIMER_STATE_KEY,
  computeRemainingFromState,
  DEFAULT_DURATION,
  type PersistedTimerState,
} from './timerState';

declare module 'react-native' {
  interface NativeModulesStatic {
    PomodoroUserDefaults?: {
      setItem: (key: string, value: string) => void;
      getItem: (key: string) => Promise<string | null>;
    };
  }
}

// A store abstracts *where* the timer state lives. One contract, two backends:
// - AsyncStorage (Android + web, and the iOS fallback)
// - App Group UserDefaults (iOS, shared with the WidgetKit extension) — used
//   when the PomodoroUserDefaults native module is present; otherwise we fall
//   back to AsyncStorage so the app keeps working before native wiring.
export interface TimerStateStore {
  save(state: PersistedTimerState): Promise<void>;
  load(): Promise<PersistedTimerState | null>;
}

class AsyncStorageStore implements TimerStateStore {
  async save(state: PersistedTimerState): Promise<void> {
    await AsyncStorage.setItem(TIMER_STATE_KEY, serializeTimerState(state));
  }

  async load(): Promise<PersistedTimerState | null> {
    const raw = await AsyncStorage.getItem(TIMER_STATE_KEY);
    return raw ? deserializeTimerState(raw) : null;
  }
}

class AppGroupUserDefaultsStore implements TimerStateStore {
  private get native() {
    return NativeModules.PomodoroUserDefaults;
  }

  async save(state: PersistedTimerState): Promise<void> {
    const raw = serializeTimerState(state);
    if (this.native) {
      this.native.setItem(TIMER_STATE_KEY, raw);
    } else {
      await AsyncStorage.setItem(TIMER_STATE_KEY, raw);
    }
  }

  async load(): Promise<PersistedTimerState | null> {
    if (this.native) {
      const raw = await this.native.getItem(TIMER_STATE_KEY);
      return raw ? deserializeTimerState(raw) : null;
    }
    const raw = await AsyncStorage.getItem(TIMER_STATE_KEY);
    return raw ? deserializeTimerState(raw) : null;
  }
}

let store: TimerStateStore | null = null;

export function getTimerStateStore(): TimerStateStore {
  if (!store) {
    store = Platform.OS === 'ios' ? new AppGroupUserDefaultsStore() : new AsyncStorageStore();
  }
  return store;
}

export async function saveTimerState(state: PersistedTimerState): Promise<void> {
  try {
    await getTimerStateStore().save(state);
  } catch {
    // Persistence is best-effort; a failure here should not break the timer.
  }
}

export async function loadTimerState(): Promise<PersistedTimerState | null> {
  try {
    return await getTimerStateStore().load();
  } catch {
    return null;
  }
}
