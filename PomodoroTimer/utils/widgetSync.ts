import React from 'react';
import { Platform } from 'react-native';
import { reloadWidgetTimelines } from './widgetReload';

// Single canonical widget-sync seam. The old androidWidget.{ts,ios.ts,android.tsx}
// triplet existed only to satisfy Metro's platform resolution; this module
// dispatches by Platform.OS instead, so callers import one name.
//
// `react-native-android-widget` is loaded via dynamic import so it stays out of
// the iOS bundle; on iOS we reload WidgetKit timelines instead.
//
// WidgetKit reloads are expensive, so callers can suppress them with
// `reloadIOS: false` — used by the one-second tick, where the Android widget
// needs a live countdown but iOS timelines should only be regenerated on state
// transitions (start/pause/stop/completion). The iOS widget derives a live
// countdown from the shared endTimestamp in its timeline entries.
export async function updateWidget(
  remainingSeconds: number,
  durationSeconds: number,
  isRunning: boolean,
  options?: { reloadIOS?: boolean }
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
  } else if (Platform.OS === 'ios' && options?.reloadIOS !== false) {
    await reloadWidgetTimelines();
  }
}
