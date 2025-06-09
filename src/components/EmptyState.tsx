import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';
import { colors } from '../styles/colors';

const EmptyState: React.FC = () => {
  const { pickAudioFile } = useAudio();
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="musical-notes" size={64} color={colors.primary[500]} />
          <Ionicons 
            name="musical-note" 
            size={24} 
            color={colors.accent[500]} 
            style={styles.smallIcon}
          />
        </View>
        
        <Text style={styles.title}>Audio Waveform Editor</Text>
        <Text style={styles.description}>
          Upload an audio file to visualize and edit its waveform. 
          Apply effects, trim segments, and export your creation.
        </Text>
        
        <TouchableOpacity 
          onPress={pickAudioFile}
          style={styles.uploadButton}
        >
          <Ionicons name="cloud-upload" size={18} color={colors.white} />
          <Text style={styles.uploadButtonText}>Select an audio file</Text>
        </TouchableOpacity>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureLabel}>Supported formats</Text>
            <Text style={styles.featureValue}>WAV, MP3, M4A</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureLabel}>Effects</Text>
            <Text style={styles.featureValue}>EQ, Reverb, Compression</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureLabel}>Export as</Text>
            <Text style={styles.featureValue}>WAV, MP3</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    backgroundColor: colors.dark[800],
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  smallIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.dark[300],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  uploadButton: {
    backgroundColor: colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.dark[700],
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 12,
    color: colors.dark[300],
    marginBottom: 4,
    textAlign: 'center',
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
  },
});

export default EmptyState;