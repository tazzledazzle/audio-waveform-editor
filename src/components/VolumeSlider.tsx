import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider } from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="volume-medium" size={18} color={colors.dark[400]} />
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary[500]}
        maximumTrackTintColor={colors.dark[600]}
        thumbStyle={styles.thumb}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  slider: {
    flex: 1,
    height: 20,
    marginLeft: 8,
  },
  thumb: {
    backgroundColor: colors.primary[500],
    width: 16,
    height: 16,
  },
});

export default VolumeSlider;