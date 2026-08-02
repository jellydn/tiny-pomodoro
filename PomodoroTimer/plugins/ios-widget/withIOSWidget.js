const { withDangerousMod, withEntitlementsPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_NAME = 'PomodoroTimerWidget';
const APP_GROUP = 'group.com.pomodorotimer.shared';

// Files that belong to the widget extension target (copied to ios/PomodoroTimerWidget/).
const WIDGET_FILES = [
  'PomodoroTimerWidget.swift',
  'Info.plist',
  'PomodoroTimerWidget.entitlements',
];

// Files that belong to the main app target (copied to ios/).
const APP_TARGET_FILES = ['PomodoroUserDefaults.swift', 'WidgetCenterModule.swift'];

function copyFiles(config, { targetDir, files, label }) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, 'ios');
      const destDir = path.join(iosPath, targetDir);
      const pluginDir = path.join(__dirname);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      for (const file of files) {
        const src = path.join(pluginDir, file);
        const dest = path.join(destDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`  Copied ${file} to ios/${targetDir}/`);
        }
      }

      console.log(label);
      return config;
    },
  ]);
}

function withIOSWidget(config) {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP];
    return config;
  });

  config = copyFiles(config, {
    targetDir: WIDGET_NAME,
    files: WIDGET_FILES,
    label: `
┌─────────────────────────────────────────────────────────────────┐
│  iOS Widget files copied to ios/${WIDGET_NAME}/         │
│                                                                 │
│  To complete widget setup in Xcode:                             │
│  1. Open ios/*.xcworkspace                                      │
│  2. File → Add Files to Project → select ${WIDGET_NAME} folder  │
│  3. File → New → Target → Widget Extension                      │
│  4. Replace generated files with the ones in ${WIDGET_NAME}/    │
│  5. Add App Group: ${APP_GROUP}                                 │
└─────────────────────────────────────────────────────────────────┘
`,
  });

  config = copyFiles(config, {
    targetDir: '.',
    files: APP_TARGET_FILES,
    label: `
┌─────────────────────────────────────────────────────────────────┐
│  App-target native modules copied to ios/                      │
│  PomodoroUserDefaults.swift · WidgetCenterModule.swift         │
│                                                                 │
│  To complete setup in Xcode:                                    │
│  1. Open ios/*.xcworkspace                                      │
│  2. File → Add Files to Project → select both Swift files       │
│  3. Add them to the app target                                  │
└─────────────────────────────────────────────────────────────────┘
`,
  });

  return config;
}

module.exports = withIOSWidget;
