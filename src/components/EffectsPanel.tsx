import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Volume, Zap, Radio } from 'lucide-react';
import Knob from './Knob';

const EffectsPanel: React.FC = () => {
  const { 
    effects, 
    toggleEffect, 
    effectParams,
    updateEffectParam 
  } = useAudio();

  return (
    <div className="p-4 border-b border-dark-700 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">Effects</h2>
      
      <div className="space-y-6">
        {/* Compression */}
        <div className="bg-dark-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Volume className="h-5 w-5 mr-2 text-primary-500" />
              <h3 className="font-medium">Compressor</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={effects.compression}
                onChange={() => toggleEffect('compression')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <Knob 
                value={effectParams.compression.threshold}
                min={-60}
                max={0}
                onChange={(value) => updateEffectParam('compression', 'threshold', value)}
                disabled={!effects.compression}
                label="Threshold"
                unit="dB"
              />
            </div>
            <div className="flex flex-col items-center">
              <Knob 
                value={effectParams.compression.ratio}
                min={1}
                max={20}
                onChange={(value) => updateEffectParam('compression', 'ratio', value)}
                disabled={!effects.compression}
                label="Ratio"
                unit=":1"
              />
            </div>
          </div>
        </div>
        
        {/* Reverb */}
        <div className="bg-dark-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Radio className="h-5 w-5 mr-2 text-primary-500" />
              <h3 className="font-medium">Reverb</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={effects.reverb}
                onChange={() => toggleEffect('reverb')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
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
            </div>
            <div className="flex flex-col items-center">
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
            </div>
          </div>
        </div>
        
        {/* EQ */}
        <div className="bg-dark-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary-500" />
              <h3 className="font-medium">EQ</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={effects.eq}
                onChange={() => toggleEffect('eq')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <Knob 
                value={effectParams.eq.low}
                min={-20}
                max={20}
                onChange={(value) => updateEffectParam('eq', 'low', value)}
                disabled={!effects.eq}
                label="Low"
                unit="dB"
              />
            </div>
            <div className="flex flex-col items-center">
              <Knob 
                value={effectParams.eq.mid}
                min={-20}
                max={20}
                onChange={(value) => updateEffectParam('eq', 'mid', value)}
                disabled={!effects.eq}
                label="Mid"
                unit="dB"
              />
            </div>
            <div className="flex flex-col items-center">
              <Knob 
                value={effectParams.eq.high}
                min={-20}
                max={20}
                onChange={(value) => updateEffectParam('eq', 'high', value)}
                disabled={!effects.eq}
                label="High"
                unit="dB"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectsPanel;