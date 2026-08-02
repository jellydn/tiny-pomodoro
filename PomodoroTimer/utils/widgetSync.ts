import React from 'react';
import { Platform } from 'react-native';
import { reloadWidgetTimelines } from './widgetReload';

// Single canonical widget-sync seam. The old androidWidget.{ts,ios.ts,android.tsx}
// triplet existed only to satisfy Metro's platform resolution; this module
// dispatches by Platform.OS instead, so callers import one name.
//
// `react-native-android-widget` is loaded via dynamic import so it stays out of
// the iOS bundle; on iOS we reload WidgetKit timelines instead.
export async function updateWidget(
  remainingSeconds: number,
  durationSeconds: number,
  isRunning: boolean
): Promise<void> {
  if (Platform.OS === 'android') {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { PomodoroWidget } = await import('../widgets/androidPomodoroWidget');

    requestWidgetUpdate({
      widgetName: 'PomodoroWidget',
      renderWidget: () =>
        React.createElement(PomodoroWidget, {
          remainingSeconds,
          durationSeconds,
          isRunning,
        }),
    });
  } else if (Platform.OS === 'ios') {
    await reloadWidgetTimelines();
  }
}
