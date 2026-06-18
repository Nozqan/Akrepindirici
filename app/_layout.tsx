import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/lib/theme-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BiometricManager } from '@/lib/biometric-manager';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isReady, setIsReady] = useState(false);
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check biometric status
        const biometricEnabled = await BiometricManager.isBiometricEnabled();

        if (biometricEnabled) {
          // Redirect to biometric lock screen
          setIsBiometricAuthenticated(false);
          router.replace('/biometric-lock');
        } else {
          // Skip biometric, go to main app
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

  // Handle deep linking and authentication state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isBiometricAuthenticated && inAuthGroup) {
      // Redirect to biometric lock if trying to access protected routes
      router.replace('/biometric-lock');
    } else if (isBiometricAuthenticated && segments[0] === 'biometric-lock') {
      // Redirect to main app if already authenticated
      router.replace('/(tabs)/home');
    }
  }, [isBiometricAuthenticated, segments, isReady]);

  if (!fontsLoaded || !isReady) {
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
