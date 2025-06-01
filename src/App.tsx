import React from 'react';
import Header from './components/Header';
import AudioEditor from './components/AudioEditor';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import { useAudio } from './contexts/AudioContext';
import EmptyState from './components/EmptyState';

function App() {
  const { audioFile } = useAudio();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {audioFile ? (
            <>
              <AudioEditor />
              <Timeline />
            </>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;