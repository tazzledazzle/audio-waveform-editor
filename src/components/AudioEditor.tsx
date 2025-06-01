import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import { useAudio } from '../contexts/AudioContext';

const AudioEditor: React.FC = () => {
  const { 
    audioFile, 
    audioBuffer, 
    isPlaying, 
    togglePlayback, 
    currentTime, 
    seekTo,
    selectedRegion,
    setSelectedRegion,
    zoom,
  } = useAudio();
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<any>(null);

  // Initialize WaveSurfer when component mounts
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      regionsPluginRef.current = RegionsPlugin.create();
      
      const timelinePlugin = TimelinePlugin.create({
        height: 20,
        timeInterval: 0.5,
        primaryLabelInterval: 5,
        secondaryLabelInterval: 1,
      });
      
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#93C5FD',
        progressColor: '#2C7BF2',
        cursorColor: '#7B68EE',
        height: 128,
        normalize: true,
        minPxPerSec: 50,
        plugins: [regionsPluginRef.current, timelinePlugin],
      });
      
      // Handle clicks on the waveform
      wavesurferRef.current.on('click', (timestamp) => {
        seekTo(timestamp);
      });
      
      // Handle region updates
      regionsPluginRef.current.on('region-created', (region: any) => {
        setSelectedRegion({
          start: region.start,
          end: region.end,
        });
      });
      
      regionsPluginRef.current.on('region-updated', (region: any) => {
        setSelectedRegion({
          start: region.start,
          end: region.end,
        });
      });
    }
    
    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (error) {
          // Ignore AbortError during cleanup as it's expected
          if (!(error instanceof Error) || error.name !== 'AbortError') {
            console.error('Error destroying WaveSurfer instance:', error);
          }
        }
        wavesurferRef.current = null;
      }
    };
  }, []);
  
  // Load audio file when it changes
  useEffect(() => {
    if (audioFile && wavesurferRef.current) {
      const fileURL = URL.createObjectURL(audioFile);
      wavesurferRef.current.load(fileURL);
      
      // Cleanup URL when done
      return () => {
        URL.revokeObjectURL(fileURL);
      };
    }
  }, [audioFile]);
  
  // Update zoom level
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(zoom * 50);
    }
  }, [zoom]);
  
  // Handle playback state changes
  useEffect(() => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);
  
  // Update cursor position
  useEffect(() => {
    if (wavesurferRef.current && !isPlaying) {
      wavesurferRef.current.setTime(currentTime);
    }
  }, [currentTime, isPlaying]);
  
  // Create or update region when selectedRegion changes
  useEffect(() => {
    if (!wavesurferRef.current || !regionsPluginRef.current) return;
    
    // Clear all existing regions
    regionsPluginRef.current.clearRegions();
    
    // Create new region if selected
    if (selectedRegion) {
      regionsPluginRef.current.addRegion({
        start: selectedRegion.start,
        end: selectedRegion.end,
        color: 'rgba(123, 104, 238, 0.2)',
        drag: true,
        resize: true,
      });
    }
  }, [selectedRegion]);
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div 
        ref={waveformRef} 
        className="waveform-container p-2 rounded-md mb-4"
      />
    </div>
  );
};

export default AudioEditor;