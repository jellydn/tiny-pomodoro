import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SettingsButtonProps {
  onPress: () => void;
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>⚙️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
});
