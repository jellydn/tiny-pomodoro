import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import { useTimer } from '../contexts/TimerContext';
import { useSettings } from '../contexts/SettingsContext';

const SOUND_FREQUENCIES: Record<string, number> = {
  bell: 800,
  chime: 1000,
  ding: 1200,
  gong: 400,
  alert: 600,
};

function playWebAudioSound(soundId: string) {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  
  const frequency = SOUND_FREQUENCIES[soundId] || 800;
  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);
}

export function CompletionNotifier() {
  const { isCompleted } = useTimer();
  const { soundEnabled, vibrationEnabled, selectedSoundId } = useSettings();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (isCompleted && !hasNotified.current) {
      hasNotified.current = true;
      
      if (soundEnabled) {
        if (Platform.OS === 'web') {
          playWebAudioSound(selectedSoundId);
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
