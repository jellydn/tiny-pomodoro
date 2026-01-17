import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

if (Platform.OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./widgets/widgetTaskHandler');
  registerWidgetTaskHandler(widgetTaskHandler);
}

registerRootComponent(App);
