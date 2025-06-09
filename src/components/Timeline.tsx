import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';
import { formatTime } from '../utils/formatTime';
import { colors } from '../styles/colors';

const { width: screenWidth } = Dimensions.get('window');

const Timeline: React.FC = () => {
  const { 
    currentTime, 
    duration, 
    seekTo, 
    isPlaying,
    selectedRegion,
    setSelectedRegion,
    audioBuffer,
  } = useAudio();

  const handleCreateRegion = () => {
    const start = currentTime;
    const end = Math.min(currentTime + 5, duration);
    setSelectedRegion({ start, end });
  };

  const handleClearRegion = () => {
    setSelectedRegion(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.leftControls}>
          <TouchableOpacity 
            onPress={handleCreateRegion}
            disabled={!audioBuffer || isPlaying}
            style={[styles.button, (!audioBuffer || isPlaying) && styles.buttonDisabled]}
          >
            <Ionicons name="cut" size={16} color={colors.white} />
            <Text style={styles.buttonText}>Create Region</Text>
          </TouchableOpacity>
          
          {selectedRegion && (
            <TouchableOpacity 
              onPress={handleClearRegion}
              style={styles.button}
            >
              <Ionicons name="trash" size={16} color={colors.white} />
              <Text style={styles.buttonText}>Clear Region</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.timeDisplay}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
      
      <View style={styles.timeline}>
        {/* Progress bar */}
        <View 
          style={[
            styles.progress,
            { width: `${(currentTime / duration) * 100}%` }
          ]}
        />
        
        {/* Playhead */}
        <View 
          style={[
            styles.playhead,
            { left: `${(currentTime / duration) * 100}%` }
          ]}
        >
          <View style={styles.playheadHandle} />
        </View>
        
        {/* Selected region */}
        {selectedRegion && (
          <View 
            style={[
              styles.region,
              { 
                left: `${(selectedRegion.start / duration) * 100}%`,
                width: `${((selectedRegion.end - selectedRegion.start) / duration) * 100}%`
              }
            ]}
          />
        )}
        
        {/* Time markers */}
        {[...Array(10)].map((_, i) => (
          <View 
            key={i}
            style={[
              styles.marker,
              { left: `${(i + 1) * 10}%` }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark[800],
    borderTopWidth: 1,
    borderTopColor: colors.dark[700],
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark[700],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  timeDisplay: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.white,
  },
  timeline: {
    height: 40,
    backgroundColor: colors.dark[700],
    borderRadius: 6,
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.primary[500],
    opacity: 0.3,
    borderRadius: 6,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: 2,
    backgroundColor: colors.primary[500],
    zIndex: 10,
  },
  playheadHandle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
    marginLeft: -5,
    marginTop: -4,
  },
  region: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: colors.accent[500],
    opacity: 0.3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.accent[500],
  },
  marker: {
    position: 'absolute',
    top: 0,
    height: 8,
    width: 1,
    backgroundColor: colors.dark[500],
  },
});

export default Timeline;