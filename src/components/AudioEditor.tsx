import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { useAudio } from '../contexts/AudioContext';
import { colors } from '../styles/colors';

const { width: screenWidth } = Dimensions.get('window');

const AudioEditor: React.FC = () => {
  const { 
    audioFile, 
    audioBuffer, 
    isPlaying, 
    currentTime, 
    seekTo,
    selectedRegion,
    zoom,
  } = useAudio();
  
  const canvasRef = useCanvasRef();
  const waveformData = useRef<number[]>([]);
  
  // Generate waveform data from audio buffer
  useEffect(() => {
    if (audioBuffer) {
      const channelData = audioBuffer.getChannelData(0);
      const samples = Math.floor(channelData.length / (screenWidth * zoom));
      const newWaveformData: number[] = [];
      
      for (let i = 0; i < screenWidth * zoom; i++) {
        const start = Math.floor(i * samples);
        const end = Math.floor((i + 1) * samples);
        let max = 0;
        
        for (let j = start; j < end && j < channelData.length; j++) {
          max = Math.max(max, Math.abs(channelData[j]));
        }
        
        newWaveformData.push(max);
      }
      
      waveformData.current = newWaveformData;
    }
  }, [audioBuffer, zoom]);
  
  // Create waveform path
  const createWaveformPath = () => {
    const path = Skia.Path.Make();
    const height = 128;
    const centerY = height / 2;
    
    if (waveformData.current.length === 0) return path;
    
    path.moveTo(0, centerY);
    
    waveformData.current.forEach((amplitude, index) => {
      const x = (index / waveformData.current.length) * screenWidth;
      const y = centerY - (amplitude * centerY * 0.8);
      
      if (index === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });
    
    // Mirror for bottom half
    for (let i = waveformData.current.length - 1; i >= 0; i--) {
      const amplitude = waveformData.current[i];
      const x = (i / waveformData.current.length) * screenWidth;
      const y = centerY + (amplitude * centerY * 0.8);
      path.lineTo(x, y);
    }
    
    path.close();
    return path;
  };
  
  const waveformPath = createWaveformPath();
  
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} ref={canvasRef}>
        <Path
          path={waveformPath}
          color={colors.primary[300]}
          style="fill"
        />
        
        {/* Progress overlay */}
        {audioBuffer && (
          <Path
            path={waveformPath}
            color={colors.primary[500]}
            style="fill"
            opacity={0.7}
          />
        )}
        
        {/* Current time cursor */}
        {audioBuffer && (
          <Path
            path={Skia.Path.Make().moveTo(
              (currentTime / audioBuffer.duration) * screenWidth, 
              0
            ).lineTo(
              (currentTime / audioBuffer.duration) * screenWidth, 
              128
            )}
            color={colors.accent[500]}
            style="stroke"
            strokeWidth={2}
          />
        )}
        
        {/* Selected region */}
        {selectedRegion && audioBuffer && (
          <Path
            path={Skia.Path.Make()
              .addRect(Skia.XYWHRect(
                (selectedRegion.start / audioBuffer.duration) * screenWidth,
                0,
                ((selectedRegion.end - selectedRegion.start) / audioBuffer.duration) * screenWidth,
                128
              ))}
            color={colors.accent[500]}
            style="fill"
            opacity={0.3}
          />
        )}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  canvas: {
    height: 128,
    backgroundColor: colors.dark[800],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.dark[700],
  },
});

export default AudioEditor;