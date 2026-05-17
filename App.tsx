import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryProvider } from './src/api/QueryProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
