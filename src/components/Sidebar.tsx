import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EffectsPanel from './EffectsPanel';
import ZoomSlider from './ZoomSlider';
import { useAudio } from '../contexts/AudioContext';
import { colors } from '../styles/colors';

const Sidebar: React.FC = () => {
  const { audioBuffer, zoom, setZoom } = useAudio();

  return (
    <View style={styles.sidebar}>
      <View style={styles.controlsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings" size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Controls</Text>
        </View>
        
        {audioBuffer && (
          <ZoomSlider value={zoom} onValueChange={setZoom} />
        )}
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {audioBuffer && <EffectsPanel />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: colors.dark[900],
    borderLeftWidth: 1,
    borderLeftColor: colors.dark[700],
  },
  controlsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[700],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.white,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default Sidebar;