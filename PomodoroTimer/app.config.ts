import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'PomodoroTimer',
  slug: 'PomodoroTimer',
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
  plugins: [
    [
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
    ],
  ],
};

export default config;
