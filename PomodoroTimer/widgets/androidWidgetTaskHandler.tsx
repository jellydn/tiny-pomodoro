import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PomodoroWidget } from './androidPomodoroWidget';
import {
  loadTimerState,
  saveTimerState,
  type PersistedTimerState,
} from '../utils/timerStorage';
import { DEFAULT_DURATION } from '../utils/timerState';
import { createSession, hydrateSession, reduceSession, type SessionState } from '../utils/sessionEngine';

export async function runWidgetTaskHandler(
  props: WidgetTaskHandlerProps
): Promise<void> {
  const { widgetAction, widgetInfo, renderWidget, clickAction } = props;

  if (widgetInfo.widgetName !== 'PomodoroWidget') {
    return;
  }

  const storedState = await loadTimerState();

  // Rehydrate from the persisted contract and reconcile against wall-clock time
  // using the same engine the app drives.
  let session: SessionState = storedState
    ? hydrateSession(storedState)
    : createSession(DEFAULT_DURATION);

  session = reduceSession(session, { type: 'reconcile', now: Date.now() });

  if (widgetAction === 'WIDGET_CLICK' && clickAction) {
    if (clickAction === 'PAUSE' && session.isRunning) {
      session = reduceSession(session, { type: 'pause' });
    } else if (clickAction === 'RESUME' && !session.isRunning && session.remaining > 0) {
      session = reduceSession(session, { type: 'start', now: Date.now() });
    }

    const newState: PersistedTimerState = {
      ...session,
      updatedAt: Date.now(),
    };
    await saveTimerState(newState);
  }

  renderWidget(
    <PomodoroWidget
      remainingSeconds={session.remaining}
      durationSeconds={session.duration}
      isRunning={session.isRunning}
    />
  );
}
