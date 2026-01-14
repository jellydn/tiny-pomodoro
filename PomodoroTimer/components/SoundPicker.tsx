import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { useSettings, AVAILABLE_SOUNDS, SoundOption } from '../contexts/SettingsContext';

const SOUND_FREQUENCIES: Record<string, number> = {
  bell: 880,
  chime: 1047,
  ding: 1319,
  gong: 220,
  alert: 440,
};

async function playTone(soundId: string): Promise<void> {
  if (Platform.OS === 'web') {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = SOUND_FREQUENCIES[soundId] || 440;
    oscillator.type = soundId === 'gong' ? 'sine' : soundId === 'alert' ? 'square' : 'triangle';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }
}

export function SoundPicker() {
  const { selectedSoundId, setSelectedSoundId, soundEnabled } = useSettings();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedSound = AVAILABLE_SOUNDS.find(s => s.id === selectedSoundId) || AVAILABLE_SOUNDS[0];

  const playPreview = useCallback(async (soundId: string) => {
    try {
      await playTone(soundId);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  const handleSelect = useCallback(async (soundId: string) => {
    await playPreview(soundId);
    setSelectedSoundId(soundId);
    setModalVisible(false);
  }, [playPreview, setSelectedSoundId]);

  const renderSoundItem = ({ item }: { item: SoundOption }) => (
    <TouchableOpacity
      style={[
        styles.soundItem,
        item.id === selectedSoundId && styles.soundItemSelected,
      ]}
      onPress={() => handleSelect(item.id)}
    >
      <Text style={[
        styles.soundItemText,
        item.id === selectedSoundId && styles.soundItemTextSelected,
      ]}>
        {item.name}
      </Text>
      <TouchableOpacity
        style={styles.previewButton}
        onPress={(e) => {
          e.stopPropagation?.();
          playPreview(item.id);
        }}
      >
        <Text style={styles.previewButtonText}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, !soundEnabled && styles.disabled]}>
          Notification Sound
        </Text>
        <Text style={[styles.settingDescription, !soundEnabled && styles.disabled]}>
          Sound to play when timer ends
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.picker, !soundEnabled && styles.pickerDisabled]}
        onPress={() => soundEnabled && setModalVisible(true)}
        disabled={!soundEnabled}
      >
        <Text style={[styles.pickerText, !soundEnabled && styles.disabled]}>
          {selectedSound.name}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sound</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={AVAILABLE_SOUNDS}
              keyExtractor={(item) => item.id}
              renderItem={renderSoundItem}
              style={styles.soundList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  disabled: {
    color: '#999',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerText: {
    fontSize: 16,
    color: '#007AFF',
  },
  chevron: {
    fontSize: 20,
    color: '#007AFF',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  soundList: {
    padding: 16,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  soundItemSelected: {
    backgroundColor: '#007AFF',
  },
  soundItemText: {
    fontSize: 16,
  },
  soundItemTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  previewButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 14,
  },
});
