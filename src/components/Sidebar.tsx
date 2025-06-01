import React from 'react';
import { Sliders, AudioWaveform as Waveform, Music, Scissors, LayoutGrid, Mic, Volume2 } from 'lucide-react';
import EffectsPanel from './EffectsPanel';
import { useAudio } from '../contexts/AudioContext';

const Sidebar: React.FC = () => {
  const { 
    audioBuffer, 
    zoom, 
    setZoom 
  } = useAudio();

  return (
    <aside className="w-72 bg-dark-900 border-r border-dark-700 flex flex-col">
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-medium mb-2 flex items-center">
          <Sliders className="h-5 w-5 mr-2 text-primary-500" />
          Controls
        </h2>
        
        {audioBuffer && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Zoom</label>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
                className="input-range w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {audioBuffer && <EffectsPanel />}
      
      <div className="p-4 mt-auto border-t border-dark-700">
        <div className="flex flex-col space-y-2">
          <button className="btn btn-secondary flex items-center justify-start">
            <Waveform size={16} className="mr-2" />
            <span>Waveform View</span>
          </button>
          <button className="btn btn-secondary flex items-center justify-start opacity-50 cursor-not-allowed">
            <LayoutGrid size={16} className="mr-2" />
            <span>Spectral View</span>
          </button>
          <button className="btn btn-secondary flex items-center justify-start opacity-50 cursor-not-allowed">
            <Music size={16} className="mr-2" />
            <span>Multi-track</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;