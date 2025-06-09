import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainApp from './src/App';
import { AudioProvider } from './src/contexts/AudioContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AudioProvider>
          <MainApp />
          <StatusBar style="light" />
        </AudioProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}