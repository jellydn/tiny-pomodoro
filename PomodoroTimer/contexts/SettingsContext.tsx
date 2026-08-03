import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  parseStoredSettings,
  reduceSettings,
  type SettingsState,
} from '../utils/settingsState';

export { AVAILABLE_SOUNDS, type SoundOption } from '../utils/sound';

interface SettingsContextType extends SettingsState {
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setSelectedSoundId: (soundId: string) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(reduceSettings, DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted settings once on mount. A stored payload is just another
  // patch over the defaults; the reducer's guard also normalizes a corrupt
  // payload that disabled both toggles. Fields are validated at this boundary
  // so a malformed payload can't smuggle wrong-typed values into state.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          dispatch(parseStoredSettings(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Persistence is a side effect of settings state, not of each setter: one
  // writer instead of three hand-rolled saveSettings calls that captured
  // stale closures. Skipped while loading so defaults never clobber stored
  // values.
  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch((error) => {
      console.error('Failed to save settings:', error);
    });
  }, [settings, isLoading]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    dispatch({ soundEnabled: enabled });
  }, []);

  const setVibrationEnabled = useCallback((enabled: boolean) => {
    dispatch({ vibrationEnabled: enabled });
  }, []);

  const setSelectedSoundId = useCallback((soundId: string) => {
    dispatch({ selectedSoundId: soundId });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
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
