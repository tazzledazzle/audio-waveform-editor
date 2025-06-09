import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@react-native-community/slider';
import { colors } from '../styles/colors';

interface ZoomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({ value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Zoom</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={50}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary[500]}
        maximumTrackTintColor={colors.dark[600]}
        thumbStyle={styles.thumb}
        step={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.dark[300],
    marginBottom: 8,
  },
  slider: {
    height: 20,
  },
  thumb: {
    backgroundColor: colors.primary[500],
    width: 16,
    height: 16,
  },
});

export default ZoomSlider;