import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { formatTime } from '../utils/formatTime';
import { Scissors, Trash2 } from 'lucide-react';

const Timeline: React.FC = () => {
  const { 
    currentTime, 
    duration, 
    seekTo, 
    isPlaying,
    selectedRegion,
    setSelectedRegion,
    audioBuffer,
  } = useAudio();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioBuffer) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const time = percentage * duration;
    
    seekTo(time);
  };

  const handleCreateRegion = () => {
    // Create a region starting from current position and extending 5 seconds (or to the end)
    const start = currentTime;
    const end = Math.min(currentTime + 5, duration);
    
    setSelectedRegion({ start, end });
  };

  const handleClearRegion = () => {
    setSelectedRegion(null);
  };

  return (
    <div className="bg-dark-800 border-t border-dark-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex space-x-2">
          <button 
            onClick={handleCreateRegion}
            disabled={!audioBuffer || isPlaying}
            className={`btn btn-secondary flex items-center space-x-1 ${!audioBuffer || isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Scissors size={16} />
            <span>Create Region</span>
          </button>
          
          {selectedRegion && (
            <button 
              onClick={handleClearRegion}
              className="btn btn-secondary flex items-center space-x-1"
            >
              <Trash2 size={16} />
              <span>Clear Region</span>
            </button>
          )}
        </div>
        
        <div className="text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      <div 
        className="h-10 bg-dark-700 rounded-md relative cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-primary-500/30 rounded-md"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        
        {/* Playhead */}
        <div 
          className="absolute top-0 h-full w-px bg-primary-500 z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-3 h-3 rounded-full bg-primary-500 -ml-1.5 -mt-1"></div>
        </div>
        
        {/* Selected region */}
        {selectedRegion && (
          <div 
            className="absolute top-0 h-full bg-accent-500/30 border-l border-r border-accent-500"
            style={{ 
              left: `${(selectedRegion.start / duration) * 100}%`,
              width: `${((selectedRegion.end - selectedRegion.start) / duration) * 100}%`
            }}
          />
        )}
        
        {/* Time markers */}
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 h-2 w-px bg-dark-500"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;