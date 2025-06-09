import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type AudioContextType = {
  audioFile: DocumentPicker.DocumentPickerAsset | null;
  setAudioFile: (file: DocumentPicker.DocumentPickerAsset | null) => void;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  togglePlayback: () => void;
  currentTime: number;
  duration: number;
  seekTo: (time: number) => void;
  volume: number;
  setVolume: (value: number) => void;
  selectedRegion: { start: number; end: number } | null;
  setSelectedRegion: (region: { start: number; end: number } | null) => void;
  zoom: number;
  setZoom: (value: number) => void;
  effects: {
    reverb: boolean;
    compression: boolean;
    eq: boolean;
  };
  toggleEffect: (effect: 'reverb' | 'compression' | 'eq') => void;
  effectParams: {
    reverb: { decay: number; wet: number };
    compression: { threshold: number; ratio: number };
    eq: { low: number; mid: number; high: number };
  };
  updateEffectParam: (
    effect: 'reverb' | 'compression' | 'eq', 
    param: string, 
    value: number
  ) => void;
  pickAudioFile: () => void;
  exportAudio: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [selectedRegion, setSelectedRegion] = useState<{ start: number; end: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const [effects, setEffects] = useState({
    reverb: false,
    compression: false,
    eq: false
  });
  
  const [effectParams, setEffectParams] = useState({
    reverb: { decay: 2, wet: 0.3 },
    compression: { threshold: -20, ratio: 4 },
    eq: { low: 0, mid: 0, high: 0 }
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio session
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Load audio file
  useEffect(() => {
    if (audioFile) {
      loadAudioFile();
    } else {
      cleanupAudio();
    }
  }, [audioFile]);

  const loadAudioFile = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioFile!.uri },
        { shouldPlay: false, volume }
      );

      soundRef.current = sound;

      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        
        // Create audio buffer for waveform visualization
        const response = await fetch(audioFile!.uri);
        const arrayBuffer = await response.arrayBuffer();
        
        // Note: In a real implementation, you'd need to decode this properly
        // For now, we'll create a mock buffer
        const mockBuffer = new AudioBuffer({
          numberOfChannels: 2,
          length: 44100 * (status.durationMillis ? status.durationMillis / 1000 : 0),
          sampleRate: 44100
        });
        
        setAudioBuffer(mockBuffer);
      }

      // Set up position updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis ? status.positionMillis / 1000 : 0);
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }
      });

    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  };

  const cleanupAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setAudioBuffer(null);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Update volume
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(volume);
    }
  }, [volume]);

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAudioFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (selectedRegion) {
          await soundRef.current.setPositionAsync(selectedRegion.start * 1000);
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekTo = async (time: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const toggleEffect = (effect: 'reverb' | 'compression' | 'eq') => {
    setEffects(prev => ({ ...prev, [effect]: !prev[effect] }));
  };

  const updateEffectParam = (
    effect: 'reverb' | 'compression' | 'eq',
    param: string,
    value: number
  ) => {
    setEffectParams(prev => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        [param]: value
      }
    }));
  };

  const exportAudio = async () => {
    if (!audioFile) return;

    try {
      const fileName = `${audioFile.name.replace(/\.[^/.]+$/, '')}_edited.wav`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Copy the original file (in a real implementation, you'd apply effects here)
      await FileSystem.copyAsync({
        from: audioFile.uri,
        to: destinationUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destinationUri);
      }
    } catch (error) {
      console.error('Error exporting audio:', error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        audioFile,
        setAudioFile,
        audioBuffer,
        isPlaying,
        togglePlayback,
        currentTime,
        duration,
        seekTo,
        volume,
        setVolume,
        selectedRegion,
        setSelectedRegion,
        zoom,
        setZoom,
        effects,
        toggleEffect,
        effectParams,
        updateEffectParam,
        pickAudioFile,
        exportAudio
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};