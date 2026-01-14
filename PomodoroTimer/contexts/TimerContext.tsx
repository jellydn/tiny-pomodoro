import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface TimerState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setDuration = useCallback((newDuration: number) => {
    setDurationState(newDuration);
    setRemaining(newDuration);
    setIsRunning(false);
    setIsPaused(false);
    clearTimer();
  }, [clearTimer]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setIsRunning(true);
    setIsPaused(false);
  }, [remaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
    clearTimer();
  }, [clearTimer]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setRemaining(duration);
    clearTimer();
  }, [duration, clearTimer]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setRemaining(duration);
    clearTimer();
  }, [duration, clearTimer]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
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

  useEffect(() => {
    if (remaining <= 0 && isRunning) {
      setIsRunning(false);
    }
  }, [remaining, isRunning]);

  return (
    <TimerContext.Provider
      value={{
        duration,
        remaining,
        isRunning,
        isPaused,
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
