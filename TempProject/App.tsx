import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light" backgroundColor="#1877f2" />
      <HomeScreen />
    </SafeAreaProvider>
  );
}
