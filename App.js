import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AudioProvider } from './context/AudioProvider';
import TabNavigator from './navigation/TabNavigator';

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </AudioProvider>
  );
}
