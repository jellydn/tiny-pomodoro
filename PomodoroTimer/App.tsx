import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { TimerProvider } from './contexts/TimerContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PresetButtons } from './components/PresetButtons';
import { CircularProgress } from './components/CircularProgress';
import { TimerControls } from './components/TimerControls';
import { SettingsButton } from './components/SettingsButton';
import { SettingsScreen } from './components/SettingsScreen';
import { CompletionNotifier } from './components/CompletionNotifier';

type Screen = 'main' | 'settings';

function MainScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <View style={styles.container}>
      <SettingsButton onPress={onOpenSettings} />
      <CircularProgress />
      <PresetButtons />
      <TimerControls />
      <StatusBar style="auto" />
    </View>
  );
}

function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  if (currentScreen === 'settings') {
    return <SettingsScreen onBack={() => setCurrentScreen('main')} />;
  }

  return <MainScreen onOpenSettings={() => setCurrentScreen('settings')} />;
}

export default function App() {
  return (
    <SettingsProvider>
      <TimerProvider>
        <CompletionNotifier />
        <AppNavigator />
      </TimerProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
