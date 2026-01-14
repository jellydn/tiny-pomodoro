import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTimer } from '../contexts/TimerContext';

const SIZE = 250;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularProgress() {
  const { duration, remaining } = useTimer();

  const progress = duration > 0 ? remaining / duration : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#E0E0E0"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#007AFF"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{timeString}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
});
