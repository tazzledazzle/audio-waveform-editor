import React from 'react';
import { Upload, Music, AudioWaveform as Waveform } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const EmptyState: React.FC = () => {
  const { setAudioFile } = useAudio();
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-dark-800 rounded-lg p-8 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Waveform size={64} className="text-primary-500" />
            <Music size={24} className="text-accent-500 absolute -bottom-1 -right-1" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-2">Audio Waveform Editor</h2>
        <p className="text-dark-300 mb-6">
          Upload an audio file to visualize and edit its waveform. 
          Apply effects, trim segments, and export your creation.
        </p>
        
        <label className="btn btn-primary flex items-center justify-center space-x-2 w-full cursor-pointer">
          <Upload size={18} />
          <span>Select an audio file</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-dark-700 rounded-md text-center">
            <p className="text-xs text-dark-300">Supported formats</p>
            <p className="text-sm font-medium">WAV, MP3, OGG</p>
          </div>
          <div className="p-3 bg-dark-700 rounded-md text-center">
            <p className="text-xs text-dark-300">Effects</p>
            <p className="text-sm font-medium">EQ, Reverb, Compression</p>
          </div>
          <div className="p-3 bg-dark-700 rounded-md text-center">
            <p className="text-xs text-dark-300">Export as</p>
            <p className="text-sm font-medium">WAV, MP3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;