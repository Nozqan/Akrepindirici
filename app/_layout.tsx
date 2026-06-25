import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider } from '@/lib/theme-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BiometricManager } from '@/lib/biometric-manager';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const [isReady, setIsReady] = useState(false);
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const biometricEnabled = await BiometricManager.isBiometricEnabled();

        if (biometricEnabled) {
          setIsBiometricAuthenticated(false);
          router.replace('/biometric-lock');
        } else {
          setIsBiometricAuthenticated(true);
        }

        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true);
      }
    };

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isBiometricAuthenticated && inAuthGroup) {
      router.replace('/biometric-lock');
    } else if (isBiometricAuthenticated && segments[0] === 'biometric-lock') {
      router.replace('/(tabs)/home');
    }
  }, [isBiometricAuthenticated, segments, isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen
            name="biometric-lock"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="oauth/callback"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
