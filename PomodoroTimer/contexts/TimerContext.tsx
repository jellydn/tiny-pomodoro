import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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

export function TimerProvider({ children }: { children: ReactNode }) {
  const [duration, setDurationState] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
  }, [clearTimer, cancelScheduledNotification]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    endTimeRef.current = Date.now() + remaining * 1000;
    scheduleCompletionNotification(remaining);
  }, [remaining, scheduleCompletionNotification]);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
  }, [clearTimer, cancelScheduledNotification]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setRemaining(duration);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
  }, [duration, clearTimer, cancelScheduledNotification]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setRemaining(duration);
    endTimeRef.current = null;
    clearTimer();
    cancelScheduledNotification();
  }, [duration, clearTimer, cancelScheduledNotification]);

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
        } else {
          setRemaining(newRemaining);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            setIsCompleted(true);
            endTimeRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [isRunning, clearTimer]);

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
