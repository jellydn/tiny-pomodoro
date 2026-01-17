import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { PomodoroWidget } from '../widgets/PomodoroWidget';

export function updateAndroidWidget(
  remainingSeconds: number,
  durationSeconds: number,
  isRunning: boolean
) {
  requestWidgetUpdate({
    widgetName: 'PomodoroWidget',
    renderWidget: () => (
      <PomodoroWidget
        remainingSeconds={remainingSeconds}
        durationSeconds={durationSeconds}
        isRunning={isRunning}
      />
    ),
  });
}
