import React from 'react';
import { AudioWaveform as Waveform, Download, Upload, Play, Pause, Volume2, Scissors } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const Header: React.FC = () => {
  const { 
    audioFile, 
    setAudioFile, 
    isPlaying, 
    togglePlayback,
    audioBuffer,
    volume,
    setVolume 
  } = useAudio();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
    }
  };

  const handleExport = async () => {
    if (!audioBuffer) return;
    
    // Create a new offline context to render the audio with effects
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
    });
    
    // Create a buffer source from the audio buffer
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    
    // Render the audio
    const renderedBuffer = await offlineCtx.startRendering();
    
    // Convert the rendered buffer to WAV format
    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
    
    // Create a download link
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = audioFile?.name.replace(/\.[^/.]+$/, '') + '_edited.wav';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Helper function to convert AudioBuffer to WAV Blob
  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // Write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"
    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit
    setUint32(0x61746164);                         // "data" chunk
    setUint32(length - pos - 4);                   // chunk length

    // Write interleaved data
    for (i = 0; i < numOfChan; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // Clamp the sample to the [-1, 1] range
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        // Convert to 16-bit signed integer
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        setInt16(sample);
      }
      offset++;
    }

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    function setInt16(data: number) {
      view.setInt16(pos, data, true);
      pos += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  return (
    <header className="bg-dark-900 border-b border-dark-700 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Waveform className="h-6 w-6 text-accent-500" />
          <h1 className="text-xl font-semibold text-white">Audio Waveform Editor</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {audioBuffer && (
            <>
              <button 
                onClick={togglePlayback}
                className="btn btn-secondary flex items-center space-x-1"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <Volume2 size={18} className="text-dark-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="input-range w-24"
                />
              </div>
            </>
          )}
          
          <label className="btn btn-secondary flex items-center space-x-1 cursor-pointer">
            <Upload size={18} />
            <span>Import</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          {audioBuffer && (
            <button 
              onClick={handleExport}
              className="btn btn-primary flex items-center space-x-1"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;