import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PomodoroWidget } from './PomodoroWidget';
import {
  loadTimerState,
  saveTimerState,
  computeRemainingFromState,
  type PersistedTimerState,
} from '../utils/timerStorage';

const DEFAULT_DURATION = 25 * 60;

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps
): Promise<void> {
  const { widgetAction, widgetInfo, renderWidget, clickAction } = props;

  if (widgetInfo.widgetName !== 'PomodoroWidget') {
    return;
  }

  let remainingSeconds = DEFAULT_DURATION;
  let durationSeconds = DEFAULT_DURATION;
  let isRunning = false;

  const storedState = await loadTimerState();

  if (storedState) {
    durationSeconds = storedState.duration ?? DEFAULT_DURATION;
    const computed = computeRemainingFromState(storedState);
    remainingSeconds = computed.remaining;
    isRunning = computed.isRunning;

    if (widgetAction === 'WIDGET_CLICK' && clickAction) {
      if (clickAction === 'PAUSE' && isRunning) {
        isRunning = false;
        const newState: PersistedTimerState = {
          duration: durationSeconds,
          remaining: remainingSeconds,
          isRunning: false,
          isPaused: true,
          isCompleted: false,
          endTimestamp: null,
          updatedAt: Date.now(),
        };
        await saveTimerState(newState);
      } else if (clickAction === 'RESUME' && !isRunning && remainingSeconds > 0) {
        isRunning = true;
        const endTimestamp = Date.now() + remainingSeconds * 1000;
        const newState: PersistedTimerState = {
          duration: durationSeconds,
          remaining: remainingSeconds,
          isRunning: true,
          isPaused: false,
          isCompleted: false,
          endTimestamp,
          updatedAt: Date.now(),
        };
        await saveTimerState(newState);
      }
    }
  }

  renderWidget(
    <PomodoroWidget
      remainingSeconds={remainingSeconds}
      durationSeconds={durationSeconds}
      isRunning={isRunning}
    />
  );
}
