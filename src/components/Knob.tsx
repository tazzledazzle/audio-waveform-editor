import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { colors } from '../styles/colors';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  unit?: string;
  valueDisplay?: (value: number) => number | string;
}

const Knob: React.FC<KnobProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  label,
  unit = '',
  valueDisplay
}) => {
  const rotation = useSharedValue(0);
  const [currentValue, setCurrentValue] = useState(value);
  
  // Calculate rotation angle based on value
  const getRotation = (val: number) => {
    const range = max - min;
    const percentage = (val - min) / range;
    return percentage * 270 - 135; // -135 to 135 degrees
  };
  
  React.useEffect(() => {
    rotation.value = getRotation(value);
    setCurrentValue(value);
  }, [value]);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startRotation = rotation.value;
    },
    onActive: (event, context) => {
      if (disabled) return;
      
      const deltaY = -event.translationY;
      const sensitivity = 0.5;
      const deltaRotation = deltaY * sensitivity;
      
      const newRotation = Math.max(-135, Math.min(135, context.startRotation + deltaRotation));
      rotation.value = newRotation;
      
      // Convert rotation back to value
      const percentage = (newRotation + 135) / 270;
      let newValue = min + percentage * (max - min);
      
      // Round to nearest step
      if (step !== 0) {
        newValue = Math.round(newValue / step) * step;
      }
      
      newValue = Math.max(min, Math.min(max, newValue));
      
      runOnJS(setCurrentValue)(newValue);
      runOnJS(onChange)(newValue);
    },
  });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  // Format the display value
  const displayValue = valueDisplay ? valueDisplay(currentValue) : currentValue.toFixed(step < 1 ? 1 : 0);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.knob, disabled && styles.disabled]}>
          <Animated.View style={[styles.indicator, animatedStyle]} />
          <Text style={styles.valueText}>{displayValue}{unit}</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.dark[300],
    marginBottom: 4,
  },
  knob: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dark[800],
    borderWidth: 2,
    borderColor: colors.dark[600],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  indicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 16,
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});

export default Knob;