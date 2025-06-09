import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './components/Header';
import AudioEditor from './components/AudioEditor';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import { useAudio } from './contexts/AudioContext';
import EmptyState from './components/EmptyState';
import { colors } from './styles/colors';

function App() {
  const { audioFile } = useAudio();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        {audioFile ? (
          <>
            <View style={styles.mainContent}>
              <AudioEditor />
              <Timeline />
            </View>
            <Sidebar />
          </>
        ) : (
          <EmptyState />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default App;