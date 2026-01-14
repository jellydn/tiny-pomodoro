import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTimer } from '../contexts/TimerContext';

export function TimerControls() {
  const { isRunning, isPaused, start, pause, stop } = useTimer();

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const startPauseLabel = isRunning ? 'Pause' : (isPaused ? 'Resume' : 'Start');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.startPauseButton]}
        onPress={handleStartPause}
      >
        <Text style={styles.buttonText}>{startPauseLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={stop}
      >
        <Text style={styles.buttonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  startPauseButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
