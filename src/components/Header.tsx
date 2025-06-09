import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';
import { colors } from '../styles/colors';
import VolumeSlider from './VolumeSlider';

const Header: React.FC = () => {
  const { 
    audioFile, 
    pickAudioFile, 
    isPlaying, 
    togglePlayback,
    audioBuffer,
    volume,
    setVolume,
    exportAudio
  } = useAudio();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Ionicons name="musical-notes" size={24} color={colors.accent[500]} />
        <Text style={styles.title}>Audio Editor</Text>
      </View>
      
      <View style={styles.rightSection}>
        {audioBuffer && (
          <>
            <TouchableOpacity 
              onPress={togglePlayback}
              style={[styles.button, styles.playButton]}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={18} 
                color={colors.white} 
              />
              <Text style={styles.buttonText}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>
            
            <VolumeSlider value={volume} onValueChange={setVolume} />
          </>
        )}
        
        <TouchableOpacity 
          onPress={pickAudioFile}
          style={[styles.button, styles.secondaryButton]}
        >
          <Ionicons name="cloud-upload" size={18} color={colors.white} />
          <Text style={styles.buttonText}>Import</Text>
        </TouchableOpacity>
        
        {audioBuffer && (
          <TouchableOpacity 
            onPress={exportAudio}
            style={[styles.button, styles.primaryButton]}
          >
            <Ionicons name="download" size={18} color={colors.white} />
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dark[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[700],
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: colors.dark[700],
  },
  playButton: {
    backgroundColor: colors.dark[700],
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Header;