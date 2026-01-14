import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { TimerProvider } from './contexts/TimerContext';
import { PresetButtons } from './components/PresetButtons';
import { CircularProgress } from './components/CircularProgress';
import { TimerControls } from './components/TimerControls';

function MainScreen() {
  return (
    <View style={styles.container}>
      <CircularProgress />
      <PresetButtons />
      <TimerControls />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <MainScreen />
    </TimerProvider>
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
