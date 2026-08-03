import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: ExpoConfig['plugins'] = [
    './plugins/android-signing/withAndroidSigning',
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
    version: '1.0.2',
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
      buildNumber: '2',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.pomodorotimer.app',
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    experiments: {
      // GitHub Pages serves this app from /tiny-pomodoro/. Keep local exports
      // root-relative unless a deployment explicitly supplies a base path.
      baseUrl: process.env.EXPO_BASE_URL ?? '',
    },
    web: {
      favicon: './assets/favicon.png',
      // PWA installability metadata. The app shell (manifest.json, icons,
      // service worker) ships from public/ — these fields drive the HTML
      // template (title, theme-color, description) and keep the config in
      // sync with public/manifest.json.
      name: 'Tiny Pomodoro',
      shortName: 'Pomodoro',
      description: 'A minimalist Pomodoro timer with sounds, vibration, and home screen widgets.',
      lang: 'en',
      themeColor: '#007AFF',
      backgroundColor: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      startUrl: '.',
      scope: '.',
    },
    extra: {
      eas: {
        projectId: 'e3224d5e-56cf-4acd-bdd6-0f09947ab0fe',
      },
      owner: 'dunghd',
    },
    plugins,
  };
};
