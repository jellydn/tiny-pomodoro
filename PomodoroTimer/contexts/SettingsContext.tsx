import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  selectedSoundId: string;
}

interface SettingsContextType extends SettingsState {
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setSelectedSoundId: (soundId: string) => void;
  isLoading: boolean;
}

const SETTINGS_STORAGE_KEY = '@pomodoro_settings';

const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  vibrationEnabled: true,
  selectedSoundId: 'bell',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [vibrationEnabled, setVibrationEnabledState] = useState(DEFAULT_SETTINGS.vibrationEnabled);
  const [selectedSoundId, setSelectedSoundIdState] = useState(DEFAULT_SETTINGS.selectedSoundId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings: SettingsState = JSON.parse(stored);
        setSoundEnabledState(settings.soundEnabled);
        setVibrationEnabledState(settings.vibrationEnabled);
        if (settings.selectedSoundId) {
          setSelectedSoundIdState(settings.selectedSoundId);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (settings: SettingsState) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setSoundEnabled = useCallback((enabled: boolean) => {
    // Prevent both being disabled
    if (!enabled && !vibrationEnabled) {
      return;
    }
    setSoundEnabledState(enabled);
    saveSettings({ soundEnabled: enabled, vibrationEnabled, selectedSoundId });
  }, [vibrationEnabled, selectedSoundId]);

  const setVibrationEnabled = useCallback((enabled: boolean) => {
    // Prevent both being disabled
    if (!enabled && !soundEnabled) {
      return;
    }
    setVibrationEnabledState(enabled);
    saveSettings({ soundEnabled, vibrationEnabled: enabled, selectedSoundId });
  }, [soundEnabled, selectedSoundId]);

  const setSelectedSoundId = useCallback((soundId: string) => {
    setSelectedSoundIdState(soundId);
    saveSettings({ soundEnabled, vibrationEnabled, selectedSoundId: soundId });
  }, [soundEnabled, vibrationEnabled]);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        vibrationEnabled,
        selectedSoundId,
        setSoundEnabled,
        setVibrationEnabled,
        setSelectedSoundId,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
