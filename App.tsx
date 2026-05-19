import './global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { QueryProvider } from './src/api/QueryProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { loadAuth } from './src/api/auth';
import { loadOnboardingState } from './src/api/onboardingState';
import { api } from './src/api/client';
import { ApiError } from './src/api/types';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  // Wait for JWT rehydration + twin check before mounting the navigator so the
  // initial route lands correctly:
  //   no token        → Signup
  //   token, no twin  → Onboarding (resumes at last completed layer)
  //   token, twin     → Main
  const [bootReady, setBootReady] = useState(false);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    (async () => {
      try {
        const auth = await loadAuth();
        await loadOnboardingState();

        if (auth?.token) {
          // Probe /twin/me. 404 NOT_FOUND just means "no twin yet — go to
          // onboarding"; any other failure also routes to onboarding so the
          // user is never stuck.
          try {
            const me = await api.twin.me();
            useAppStore.getState().setTwinSpec(me.spec);
          } catch (err) {
            if (err instanceof ApiError && err.code === 'NOT_FOUND') {
              useAppStore.getState().setHasTwin(false);
            } else {
              // Network blip / server hiccup — assume no twin so we route into
              // onboarding rather than wedging the user on a blank Main.
              useAppStore.getState().setHasTwin(false);
            }
          }
        }
      } finally {
        setBootReady(true);
      }
    })();
  }, []);

  if (!bootReady || !fontsLoaded) {
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
