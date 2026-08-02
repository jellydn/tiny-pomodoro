import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import { useTimer } from '../contexts/TimerContext';
import { useSettings } from '../contexts/SettingsContext';
import { playCompletionSound } from '../utils/sound';

export function CompletionNotifier() {
  const { isCompleted } = useTimer();
  const { soundEnabled, vibrationEnabled, selectedSoundId } = useSettings();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (isCompleted && !hasNotified.current) {
      hasNotified.current = true;
      
      if (soundEnabled) {
        if (Platform.OS === 'web') {
          playCompletionSound(selectedSoundId);
        }
      }
      
      if (vibrationEnabled) {
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 500, 200, 500]);
        }
      }
    }
    
    if (!isCompleted) {
      hasNotified.current = false;
    }
  }, [isCompleted, soundEnabled, vibrationEnabled, selectedSoundId]);

  return null;
}
