import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { saveTimerState, loadTimerState, type PersistedTimerState } from '../utils/timerStorage';
import { DEFAULT_DURATION } from '../utils/timerState';
import { updateWidget } from '../utils/widgetSync';
import { createSession, reduceSession, type SessionAction, type SessionState } from '../utils/sessionEngine';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TimerContextType extends Omit<SessionState, 'endTimestamp'> {
  setDuration: (duration: number) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(() => createSession(DEFAULT_DURATION));
  const [isHydrated, setIsHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  // Latest session, readable from interval/AppState callbacks without stale
  // closures. Every state change flows through `commit`, which writes the ref
  // synchronously so side effects always run against the freshest state.
  const sessionRef = useRef<SessionState>(session);

  const persistState = useCallback((next: SessionState) => {
    const fullState: PersistedTimerState = {
      ...next,
      updatedAt: Date.now(),
    };
    saveTimerState(fullState);
    void updateWidget(next.remaining, next.duration, next.isRunning);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelScheduledNotification = useCallback(async () => {
    if (scheduledNotificationRef.current) {
      await Notifications.cancelScheduledNotificationAsync(scheduledNotificationRef.current);
      scheduledNotificationRef.current = null;
    }
  }, []);

  const scheduleCompletionNotification = useCallback(async (secondsFromNow: number) => {
    if (Platform.OS === 'web') return;

    await cancelScheduledNotification();

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Complete! 🍅',
        body: 'Your Pomodoro session has finished.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, secondsFromNow),
      },
    });
    scheduledNotificationRef.current = id;
  }, [cancelScheduledNotification]);

  const commit = useCallback((next: SessionState) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const applyAction = useCallback((action: SessionAction) => {
    const prev = sessionRef.current;
    const next = reduceSession(prev, action);
    if (next === prev) return;
    commit(next);
    if (next.isRunning) {
      void scheduleCompletionNotification(next.remaining);
    } else if (!next.isCompleted) {
      void cancelScheduledNotification();
    }
    persistState(next);
  }, [commit, scheduleCompletionNotification, cancelScheduledNotification, persistState]);

  const setDuration = useCallback((newDuration: number) => {
    applyAction({ type: 'setDuration', duration: newDuration });
  }, [applyAction]);

  const start = useCallback(() => {
    applyAction({ type: 'start', now: Date.now() });
  }, [applyAction]);

  const pause = useCallback(() => {
    applyAction({ type: 'pause' });
  }, [applyAction]);

  const stop = useCallback(() => {
    applyAction({ type: 'stop' });
  }, [applyAction]);

  const reset = useCallback(() => {
    applyAction({ type: 'reset' });
  }, [applyAction]);

  // Hydrate from persisted state and reconcile against wall-clock time.
  useEffect(() => {
    (async () => {
      const storedState = await loadTimerState();
      if (storedState) {
        const base: SessionState = {
          duration: storedState.duration ?? DEFAULT_DURATION,
          remaining: storedState.remaining,
          isRunning: storedState.isRunning,
          isPaused: storedState.isPaused,
          isCompleted: storedState.isCompleted,
          endTimestamp: storedState.endTimestamp,
        };
        const reconciled = reduceSession(base, { type: 'reconcile', now: Date.now() });
        commit(reconciled);
        if (reconciled.isCompleted && !storedState.isCompleted) {
          persistState(reconciled);
        }
      }
      setIsHydrated(true);
    })();
  }, [commit, persistState]);

  // Reconcile against wall-clock time when returning to the foreground.
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const prev = sessionRef.current;
        if (prev.isRunning && prev.endTimestamp) {
          const next = reduceSession(prev, { type: 'reconcile', now: Date.now() });
          commit(next);
          if (next.isCompleted && !prev.isCompleted) {
            persistState(next);
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [commit, persistState]);

  // One-second interval while running. Keyed only on isRunning so the
  // interval is not torn down and recreated on every tick; reduceSession's
  // no-op guard handles late ticks after pause/completion.
  useEffect(() => {
    if (session.isRunning) {
      intervalRef.current = setInterval(() => {
        const prev = sessionRef.current;
        const next = reduceSession(prev, { type: 'tick', now: Date.now() });
        if (next === prev) return;
        commit(next);
        if (next.isCompleted && !prev.isCompleted) {
          clearTimer();
          // persistState syncs the widget too — no separate updateWidget here.
          persistState(next);
        } else if (next.isRunning) {
          // Live countdown on the widget. iOS WidgetKit timelines are not
          // reloaded here — they are regenerated on state transitions only
          // (see updateWidget's reloadIOS option).
          void updateWidget(next.remaining, next.duration, true, { reloadIOS: false });
        }
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [session.isRunning, commit, clearTimer, persistState]);

  if (!isHydrated) {
    return null;
  }

  return (
    <TimerContext.Provider
      value={{
        duration: session.duration,
        remaining: session.remaining,
        isRunning: session.isRunning,
        isPaused: session.isPaused,
        isCompleted: session.isCompleted,
        setDuration,
        start,
        pause,
        stop,
        reset,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
