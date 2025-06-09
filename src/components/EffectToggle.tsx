import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

interface EffectToggleProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  onToggle: () => void;
}

const EffectToggle: React.FC<EffectToggleProps> = ({ title, icon, enabled, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons name={icon} size={20} color={colors.primary[500]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <TouchableOpacity onPress={onToggle} style={styles.toggle}>
        <View style={[styles.toggleTrack, enabled && styles.toggleTrackActive]}>
          <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    marginLeft: 8,
  },
  toggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.dark[600],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.primary[500],
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default EffectToggle;