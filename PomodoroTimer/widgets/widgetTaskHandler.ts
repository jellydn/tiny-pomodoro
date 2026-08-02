import { Platform } from 'react-native';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

// Canonical widget task handler. The old widgetTaskHandler.{ts,ios.ts,android.tsx}
// triplet existed only to satisfy Metro's platform resolution; this module
// dispatches by Platform.OS instead, so bootstrap registers one name. The
// Android implementation is loaded dynamically so it stays out of the iOS
// bundle.
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  const { runWidgetTaskHandler } = await import('./androidWidgetTaskHandler');
  await runWidgetTaskHandler(props);
}
