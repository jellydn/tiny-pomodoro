'use no memo';

import React from 'react';
import {
  FlexWidget,
  TextWidget,
  SvgWidget,
} from 'react-native-android-widget';

export type PomodoroWidgetProps = {
  remainingSeconds: number;
  durationSeconds: number;
  isRunning: boolean;
};

export function PomodoroWidget({
  remainingSeconds,
  durationSeconds,
  isRunning,
}: PomodoroWidgetProps) {
  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');

  const progress = durationSeconds > 0 ? remainingSeconds / durationSeconds : 1;
  const progressPercent = Math.round(progress * 100);

  const size = 60;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const progressSvg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="#E0E0E0"
        stroke-width="${strokeWidth}"
      />
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="${isRunning ? '#007AFF' : '#9E9E9E'}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        stroke-linecap="round"
        transform="rotate(-90 ${size / 2} ${size / 2})"
      />
    </svg>
  `;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
      }}
      clickAction="OPEN_APP"
    >
      <SvgWidget svg={progressSvg} style={{ width: size, height: size }} />

      <FlexWidget
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 12,
        }}
      >
        <TextWidget
          text={`${minutes}:${seconds}`}
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#222222',
          }}
        />

        <FlexWidget
          style={{
            marginTop: 4,
            paddingHorizontal: 12,
            paddingVertical: 4,
            backgroundColor: isRunning ? '#FF9500' : '#34C759',
            borderRadius: 12,
          }}
          clickAction={isRunning ? 'PAUSE' : 'RESUME'}
        >
          <TextWidget
            text={isRunning ? 'Pause' : 'Resume'}
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#FFFFFF',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
