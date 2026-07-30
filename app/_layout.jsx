import '../global.css';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/src/store/useAppStore';
import { useSmsParser } from '@/src/hooks/useSmsParser';
import { useExpenseAlerts } from '@/src/hooks/useExpenseAlerts';
import { AutoTransactionPopup } from '@/src/components/AutoTransactionPopup';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppEffects() {
  useSmsParser();
  useExpenseAlerts();
  return null;
}

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const initialize = useAppStore((state) => state.initialize);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    // Legacy aliases mapped to Inter_700Bold / Inter_400Regular
    'Inter-Black': Inter_700Bold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Light': Inter_300Light,
    'Inter-Medium': Inter_600SemiBold,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then((val) => {
      setHasSeenOnboarding(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        if (!hasSeenOnboarding) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(auth)/landing');
        }
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);
  }, [isAuthenticated, router, segments, fontsLoaded, hasSeenOnboarding]);

  if (!fontsLoaded || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#03040D' }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DarkTheme}>
          <AppEffects />
          <LinearGradient
            colors={['#03040D', '#080B1C']}
            style={StyleSheet.absoluteFillObject}
          />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="bankwise" options={{ headerShown: false }} />
            <Stack.Screen name="health-report" options={{ headerShown: false }} />
            <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
          </Stack>
          <AutoTransactionPopup />
          <StatusBar style="light" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
