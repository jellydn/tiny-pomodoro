import { Platform } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    WidgetCenter: {
      reloadAllTimelines: () => void;
    };
  }
}

export async function reloadWidgetTimelines(): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      const { NativeModules } = await import('react-native');
      if (NativeModules.WidgetCenter) {
        NativeModules.WidgetCenter.reloadAllTimelines();
      }
    } catch {
    }
  }
}
