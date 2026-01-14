import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TimerProvider, useTimer } from './contexts/TimerContext';

function TimerDisplay() {
  const { remaining, isRunning, isPaused } = useTimer();
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View>
      <Text style={styles.timer}>{timeString}</Text>
      <Text style={styles.status}>
        {isRunning ? 'Running' : isPaused ? 'Paused' : 'Stopped'}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <View style={styles.container}>
        <TimerDisplay />
        <StatusBar style="auto" />
      </View>
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
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
});
