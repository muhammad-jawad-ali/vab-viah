import './global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from './src/api/QueryProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { loadAuth } from './src/api/auth';

export default function App() {
  // Wait for JWT rehydration before mounting the navigator so the initial
  // route lands correctly (Signup if no token, Main if token exists).
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadAuth();
      } finally {
        setBootReady(true);
      }
    })();
  }, []);

  if (!bootReady) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#064e3b',
          }}
        >
          <ActivityIndicator color="#fcd34d" />
        </View>
      </SafeAreaProvider>
    );
  }

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
