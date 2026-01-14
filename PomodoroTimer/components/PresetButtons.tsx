import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTimer } from '../contexts/TimerContext';

const PRESETS = [25, 30, 45, 50];

export function PresetButtons() {
  const { duration, setDuration, isRunning } = useTimer();
  const selectedMinutes = duration / 60;

  return (
    <View style={styles.container}>
      {PRESETS.map((minutes) => {
        const isSelected = selectedMinutes === minutes;
        return (
          <TouchableOpacity
            key={minutes}
            style={[
              styles.button,
              isSelected && styles.buttonSelected,
            ]}
            onPress={() => setDuration(minutes * 60)}
            disabled={isRunning}
          >
            <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
              {minutes}
            </Text>
            <Text style={[styles.buttonLabel, isSelected && styles.buttonLabelSelected]}>
              min
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: 64,
  },
  buttonSelected: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  buttonTextSelected: {
    color: '#fff',
  },
  buttonLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonLabelSelected: {
    color: '#fff',
  },
});
