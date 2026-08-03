// Pure settings state for the Pomodoro timer.
//
// This module owns the settings schema, the defaults, and every state
// transition through a single reducer — mirroring sessionEngine.ts. It has no
// I/O and no React imports; persistence (AsyncStorage) lives in the caller as
// an effect. The at-least-one-toggle rule (a finished session must never go
// completely silent) is enforced here so the UI and the reducer share one
// guard instead of two hand-copied copies.

export const SETTINGS_STORAGE_KEY = '@pomodoro_settings';

export interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  selectedSoundId: string;
}

export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  vibrationEnabled: true,
  selectedSoundId: 'bell',
};

// A settings change is a partial patch merged over the current state.
export type SettingsPatch = Partial<SettingsState>;

// Coerce an unknown persisted payload into a safe patch. Wrong-typed fields
// are dropped rather than merged, so a corrupt AsyncStorage value can't smuggle
// bad values into state (e.g. a null selectedSoundId).
export function parseStoredSettings(raw: unknown): SettingsPatch {
  if (typeof raw !== 'object' || raw === null) {
    return {};
  }
  const patch: SettingsPatch = {};
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.soundEnabled === 'boolean') {
    patch.soundEnabled = candidate.soundEnabled;
  }
  if (typeof candidate.vibrationEnabled === 'boolean') {
    patch.vibrationEnabled = candidate.vibrationEnabled;
  }
  if (typeof candidate.selectedSoundId === 'string' && candidate.selectedSoundId.length > 0) {
    patch.selectedSoundId = candidate.selectedSoundId;
  }
  return patch;
}

// The at-least-one guard: a patch that would disable both notification
// methods is rejected, because a completed pomodoro would then go unnoticed.
export function reduceSettings(state: SettingsState, patch: SettingsPatch): SettingsState {
  const next = { ...state, ...patch };
  if (!next.soundEnabled && !next.vibrationEnabled) {
    return state;
  }
  return next;
}

// UI helpers: whether the Sound / Vibration switch may be turned off. Derived
// from the same rule the reducer enforces, so a disabled switch and a rejected
// patch can never disagree.
export function canDisableSound(state: Pick<SettingsState, 'vibrationEnabled'>): boolean {
  return state.vibrationEnabled;
}

export function canDisableVibration(state: Pick<SettingsState, 'soundEnabled'>): boolean {
  return state.soundEnabled;
}
