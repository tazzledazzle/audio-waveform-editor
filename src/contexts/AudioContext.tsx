import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

type AudioContextType = {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
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
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
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

  const playerRef = useRef<Tone.Player | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const compressorRef = useRef<Tone.Compressor | null>(null);
  const eqRef = useRef<Tone.EQ3 | null>(null);

  // Create audio processing chain
  useEffect(() => {
    if (Tone.Transport.state !== 'started') {
      Tone.start();
    }
    
    // Initialize effects
    reverbRef.current = new Tone.Reverb({
      decay: effectParams.reverb.decay,
      wet: effectParams.reverb.wet
    }).toDestination();
    
    compressorRef.current = new Tone.Compressor({
      threshold: effectParams.compression.threshold,
      ratio: effectParams.compression.ratio
    }).connect(reverbRef.current);
    
    eqRef.current = new Tone.EQ3({
      low: effectParams.eq.low,
      mid: effectParams.eq.mid,
      high: effectParams.eq.high
    }).connect(compressorRef.current);
    
    return () => {
      // Cleanup
      playerRef.current?.dispose();
      reverbRef.current?.dispose();
      compressorRef.current?.dispose();
      eqRef.current?.dispose();
    };
  }, []);

  // Load audio file
  useEffect(() => {
    if (audioFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const buffer = await Tone.context.decodeAudioData(arrayBuffer);
          setAudioBuffer(buffer);
          setDuration(buffer.duration);
          
          // Create player and connect to effects chain
          if (playerRef.current) {
            playerRef.current.dispose();
          }
          
          playerRef.current = new Tone.Player(buffer).connect(eqRef.current as Tone.ToneAudioNode);
          playerRef.current.volume.value = Tone.gainToDb(volume);
          
          // Update effects routing based on enabled state
          updateEffectsRouting();
          
        } catch (error) {
          console.error('Error decoding audio data:', error);
        }
      };
      reader.readAsArrayBuffer(audioFile);
    } else {
      setAudioBuffer(null);
      setDuration(0);
      setCurrentTime(0);
      setIsPlaying(false);
      playerRef.current?.stop();
    }
  }, [audioFile]);

  // Update volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, [volume]);

  // Handle playback and time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current) {
        setCurrentTime(playerRef.current.immediate());
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update effect parameters
  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.decay = effectParams.reverb.decay;
      reverbRef.current.wet.value = effectParams.reverb.wet;
    }
    
    if (compressorRef.current) {
      compressorRef.current.threshold.value = effectParams.compression.threshold;
      compressorRef.current.ratio.value = effectParams.compression.ratio;
    }
    
    if (eqRef.current) {
      eqRef.current.low.value = effectParams.eq.low;
      eqRef.current.mid.value = effectParams.eq.mid;
      eqRef.current.high.value = effectParams.eq.high;
    }
  }, [effectParams]);

  // Update effects routing when toggled
  const updateEffectsRouting = () => {
    if (!playerRef.current) return;
    
    // Disconnect everything
    playerRef.current.disconnect();
    eqRef.current?.disconnect();
    compressorRef.current?.disconnect();
    reverbRef.current?.disconnect();
    
    // Connect based on active effects
    if (effects.eq && eqRef.current) {
      if (effects.compression && compressorRef.current) {
        if (effects.reverb && reverbRef.current) {
          // EQ -> Compressor -> Reverb -> Output
          playerRef.current.connect(eqRef.current);
          eqRef.current.connect(compressorRef.current);
          compressorRef.current.connect(reverbRef.current);
          reverbRef.current.toDestination();
        } else {
          // EQ -> Compressor -> Output
          playerRef.current.connect(eqRef.current);
          eqRef.current.connect(compressorRef.current);
          compressorRef.current.toDestination();
        }
      } else if (effects.reverb && reverbRef.current) {
        // EQ -> Reverb -> Output
        playerRef.current.connect(eqRef.current);
        eqRef.current.connect(reverbRef.current);
        reverbRef.current.toDestination();
      } else {
        // EQ -> Output
        playerRef.current.connect(eqRef.current);
        eqRef.current.toDestination();
      }
    } else if (effects.compression && compressorRef.current) {
      if (effects.reverb && reverbRef.current) {
        // Compressor -> Reverb -> Output
        playerRef.current.connect(compressorRef.current);
        compressorRef.current.connect(reverbRef.current);
        reverbRef.current.toDestination();
      } else {
        // Compressor -> Output
        playerRef.current.connect(compressorRef.current);
        compressorRef.current.toDestination();
      }
    } else if (effects.reverb && reverbRef.current) {
      // Reverb -> Output
      playerRef.current.connect(reverbRef.current);
      reverbRef.current.toDestination();
    } else {
      // Direct to output
      playerRef.current.toDestination();
    }
  };

  const togglePlayback = () => {
    if (!playerRef.current || !audioBuffer) return;
    
    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      // If there's a selected region, play only that region
      if (selectedRegion) {
        playerRef.current.start(undefined, selectedRegion.start);
        // Schedule stop at the end of the region
        Tone.Transport.scheduleOnce(() => {
          playerRef.current?.stop();
          setIsPlaying(false);
        }, Tone.now() + (selectedRegion.end - selectedRegion.start));
      } else {
        playerRef.current.start(undefined, currentTime);
      }
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (!playerRef.current || !audioBuffer) return;
    
    const wasPlaying = isPlaying;
    
    // Stop current playback
    if (wasPlaying) {
      playerRef.current.stop();
    }
    
    setCurrentTime(time);
    
    // Resume playback from new position if it was playing before
    if (wasPlaying) {
      playerRef.current.start(undefined, time);
    }
  };

  const toggleEffect = (effect: 'reverb' | 'compression' | 'eq') => {
    setEffects(prev => {
      const newEffects = { ...prev, [effect]: !prev[effect] };
      
      // Need to update in next tick after state has been updated
      setTimeout(() => updateEffectsRouting(), 0);
      
      return newEffects;
    });
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
        updateEffectParam
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