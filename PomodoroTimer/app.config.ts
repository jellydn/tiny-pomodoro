import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: ExpoConfig['plugins'] = [
    './plugins/ios-widget/withIOSWidget',
  ];

  // Add Android widget plugin - the plugin itself should handle iOS gracefully
  plugins.unshift([
    'react-native-android-widget',
    {
      widgets: [
        {
          name: 'PomodoroWidget',
          label: 'Pomodoro Timer',
          description: 'Shows the current pomodoro session with remaining time and controls',
          minWidth: '180dp',
          minHeight: '110dp',
          updatePeriodMillis: 0,
        },
      ],
    },
  ]);

  return {
    ...config,
    name: 'Tiny Pomodoro',
    slug: 'tiny-pomodoro',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pomodorotimer.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.pomodorotimer.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '6850ae80-bbde-4a62-9c45-cba7071478a6',
      },
    },
    plugins,
  };
};
