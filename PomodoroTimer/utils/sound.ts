import { Platform } from 'react-native';

export interface SoundOption {
  id: string;
  name: string;
}

export const AVAILABLE_SOUNDS: SoundOption[] = [
  { id: 'bell', name: 'Bell' },
  { id: 'chime', name: 'Chime' },
  { id: 'ding', name: 'Ding' },
  { id: 'gong', name: 'Gong' },
  { id: 'alert', name: 'Alert' },
];

// Single frequency table. Previously duplicated in SoundPicker and
// CompletionNotifier with different values (bell 880 vs 800, chime 1047 vs
// 1000, ...), so a preview and the actual completion never matched. Both now
// read the same table, so the sound the user picks is the sound they hear.
export const SOUND_FREQUENCIES: Record<string, number> = {
  bell: 880,
  chime: 1047,
  ding: 1319,
  gong: 220,
  alert: 440,
};

function getWaveform(soundId: string): OscillatorType {
  if (soundId === 'gong') return 'sine';
  if (soundId === 'alert') return 'square';
  return 'triangle';
}

function playToneOnWeb(soundId: string, durationMs: number): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const AudioContextCtor =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) return;

  const ctx = new AudioContextCtor();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = SOUND_FREQUENCIES[soundId] || 440;
  oscillator.type = getWaveform(soundId);

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + durationMs / 1000);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

// Short preview, used by the sound picker.
export function playSoundPreview(soundId: string): void {
  playToneOnWeb(soundId, 500);
}

// Full-length completion tone. On native, completion audio comes from the
// scheduled notification (`sound: true`); this covers the web target.
export function playCompletionSound(soundId: string): void {
  playToneOnWeb(soundId, 1000);
}
