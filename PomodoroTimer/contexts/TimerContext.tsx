import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { saveTimerState, loadTimerState, computeRemainingFromState, type PersistedTimerState } from '../utils/timerStorage';
import { reloadWidgetTimelines } from '../utils/widgetReload';
import { updateAndroidWidget } from '../utils/androidWidget';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TimerState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

interface TimerContextType extends TimerState {
  setDuration: (duration: number) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}

const DEFAULT_DURATION = 25 * 60;

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function updateWidget(remainingSeconds: number, durationSeconds: number, isRunning: boolean) {
  if (Platform.OS === 'android') {
    updateAndroidWidget(remainingSeconds, durationSeconds, isRunning);
  } else if (Platform.OS === 'ios') {
    reloadWidgetTimelines();
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [duration, setDurationState] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const persistState = useCallback((state: Omit<PersistedTimerState, 'updatedAt'>) => {
    const fullState: PersistedTimerState = {
      ...state,
      updatedAt: Date.now(),
    };
    saveTimerState(fullState);
    updateWidget(state.remaining, state.duration, state.isRunning);
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

  const setDuration = useCallback((newDuration: number) => {
    setDurationState(newDuration);
    setRemaining(newDuration);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
    persistState({
      duration: newDuration,
      remaining: newDuration,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      endTimestamp: null,
    });
  }, [clearTimer, cancelScheduledNotification, persistState]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    const endTimestamp = Date.now() + remaining * 1000;
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    endTimeRef.current = endTimestamp;
    scheduleCompletionNotification(remaining);
    persistState({
      duration,
      remaining,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      endTimestamp,
    });
  }, [remaining, duration, scheduleCompletionNotification, persistState]);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
    persistState({
      duration,
      remaining,
      isRunning: false,
      isPaused: true,
      isCompleted: false,
      endTimestamp: null,
    });
  }, [duration, remaining, clearTimer, cancelScheduledNotification, persistState]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setRemaining(duration);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
    persistState({
      duration,
      remaining: duration,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      endTimestamp: null,
    });
  }, [duration, clearTimer, cancelScheduledNotification, persistState]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setRemaining(duration);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
    persistState({
      duration,
      remaining: duration,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      endTimestamp: null,
    });
  }, [duration, clearTimer, cancelScheduledNotification, persistState]);

  useEffect(() => {
    (async () => {
      const storedState = await loadTimerState();
      if (storedState) {
        const computed = computeRemainingFromState(storedState);
        setDurationState(storedState.duration ?? DEFAULT_DURATION);
        setRemaining(computed.remaining);
        setIsRunning(computed.isRunning);
        setIsPaused(storedState.isPaused && !computed.isRunning);
        setIsCompleted(computed.isCompleted);
        endTimeRef.current = computed.endTimestamp;
      }
      setIsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        endTimeRef.current !== null
      ) {
        const now = Date.now();
        const newRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
        if (newRemaining <= 0) {
          setRemaining(0);
          setIsRunning(false);
          setIsCompleted(true);
          endTimeRef.current = null;
          persistState({
            duration,
            remaining: 0,
            isRunning: false,
            isPaused: false,
            isCompleted: true,
            endTimestamp: null,
          });
        } else {
          setRemaining(newRemaining);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [duration, persistState]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          const next = prev <= 1 ? 0 : prev - 1;
          const endTimestamp = next > 0 ? Date.now() + next * 1000 : null;
          
          if (next === 0) {
            clearTimer();
            setIsRunning(false);
            setIsCompleted(true);
            endTimeRef.current = null;
            persistState({
              duration,
              remaining: 0,
              isRunning: false,
              isPaused: false,
              isCompleted: true,
              endTimestamp: null,
            });
          } else {
            updateWidget(next, duration, true);
          }
          
          return next;
        });
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [isRunning, clearTimer, duration, persistState]);

  if (!isHydrated) {
    return null;
  }

  return (
    <TimerContext.Provider
      value={{
        duration,
        remaining,
        isRunning,
        isPaused,
        isCompleted,
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
