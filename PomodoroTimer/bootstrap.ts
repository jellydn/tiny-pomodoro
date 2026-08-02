import { Platform } from 'react-native';

// Single bootstrap entry point. The old bootstrap.{ts,android.ts,ios.ts}
// triplet existed only to satisfy Metro's platform resolution; this module
// dispatches by Platform.OS and loads the Android widget registration
// dynamically so `react-native-android-widget` stays out of the iOS bundle.
if (Platform.OS === 'android') {
  void (async () => {
    const { registerWidgetTaskHandler } = await import('react-native-android-widget');
    const { widgetTaskHandler } = await import('./widgets/widgetTaskHandler');
    registerWidgetTaskHandler(widgetTaskHandler);
  })();
}
