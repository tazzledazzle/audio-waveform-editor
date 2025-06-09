import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { colors } from '../styles/colors';
import EffectToggle from './EffectToggle';
import Knob from './Knob';

const EffectsPanel: React.FC = () => {
  const { 
    effects, 
    toggleEffect, 
    effectParams,
    updateEffectParam 
  } = useAudio();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Effects</Text>
      
      <View style={styles.effectsContainer}>
        {/* Compression */}
        <View style={styles.effectCard}>
          <EffectToggle
            title="Compressor"
            icon="volume-medium"
            enabled={effects.compression}
            onToggle={() => toggleEffect('compression')}
          />
          
          <View style={styles.knobsContainer}>
            <Knob 
              value={effectParams.compression.threshold}
              min={-60}
              max={0}
              onChange={(value) => updateEffectParam('compression', 'threshold', value)}
              disabled={!effects.compression}
              label="Threshold"
              unit="dB"
            />
            <Knob 
              value={effectParams.compression.ratio}
              min={1}
              max={20}
              onChange={(value) => updateEffectParam('compression', 'ratio', value)}
              disabled={!effects.compression}
              label="Ratio"
              unit=":1"
            />
          </View>
        </View>
        
        {/* Reverb */}
        <View style={styles.effectCard}>
          <EffectToggle
            title="Reverb"
            icon="radio"
            enabled={effects.reverb}
            onToggle={() => toggleEffect('reverb')}
          />
          
          <View style={styles.knobsContainer}>
            <Knob 
              value={effectParams.reverb.decay}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => updateEffectParam('reverb', 'decay', value)}
              disabled={!effects.reverb}
              label="Decay"
              unit="s"
            />
            <Knob 
              value={effectParams.reverb.wet}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateEffectParam('reverb', 'wet', value)}
              disabled={!effects.reverb}
              label="Mix"
              unit="%"
              valueDisplay={(v) => Math.round(v * 100)}
            />
          </View>
        </View>
        
        {/* EQ */}
        <View style={styles.effectCard}>
          <EffectToggle
            title="EQ"
            icon="pulse"
            enabled={effects.eq}
            onToggle={() => toggleEffect('eq')}
          />
          
          <View style={styles.knobsContainer}>
            <Knob 
              value={effectParams.eq.low}
              min={-20}
              max={20}
              onChange={(value) => updateEffectParam('eq', 'low', value)}
              disabled={!effects.eq}
              label="Low"
              unit="dB"
            />
            <Knob 
              value={effectParams.eq.mid}
              min={-20}
              max={20}
              onChange={(value) => updateEffectParam('eq', 'mid', value)}
              disabled={!effects.eq}
              label="Mid"
              unit="dB"
            />
            <Knob 
              value={effectParams.eq.high}
              min={-20}
              max={20}
              onChange={(value) => updateEffectParam('eq', 'high', value)}
              disabled={!effects.eq}
              label="High"
              unit="dB"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 16,
  },
  effectsContainer: {
    gap: 24,
  },
  effectCard: {
    backgroundColor: colors.dark[800],
    borderRadius: 8,
    padding: 16,
  },
  knobsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
});

export default EffectsPanel;