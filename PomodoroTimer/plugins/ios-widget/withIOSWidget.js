const { withDangerousMod, withEntitlementsPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_NAME = 'PomodoroTimerWidget';
const APP_GROUP = 'group.com.pomodorotimer.shared';

function withIOSWidget(config) {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP];
    return config;
  });

  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, 'ios');
      const widgetPath = path.join(iosPath, WIDGET_NAME);
      const pluginWidgetPath = path.join(__dirname);

      if (!fs.existsSync(widgetPath)) {
        fs.mkdirSync(widgetPath, { recursive: true });
      }

      const filesToCopy = [
        'PomodoroTimerWidget.swift',
        'Info.plist',
        'PomodoroTimerWidget.entitlements',
      ];

      for (const file of filesToCopy) {
        const src = path.join(pluginWidgetPath, file);
        const dest = path.join(widgetPath, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`  Copied ${file} to ${WIDGET_NAME}/`);
        }
      }

      console.log(`
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
`);

      return config;
    },
  ]);

  return config;
}

module.exports = withIOSWidget;
