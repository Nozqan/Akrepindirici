import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export class SecurityManager {
  private static instance: SecurityManager;
  private appState = useRef(AppState.currentState);
  private isAuthenticated = false;
  private biometricEnabled = false;

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Activity Lifecycle Observer
   * Tetiklenir: App arka plana gittiğinde, ön plana geldiğinde
   */
  async setupLifecycleObserver(onResume: () => void, onPause: () => void) {
    const subscription = AppState.addEventListener('change', this.handleAppStateChange(onResume, onPause));
    return () => subscription.remove();
  }

  private handleAppStateChange = (onResume: () => void, onPause: () => void) => {
    return async (nextAppState: AppStateStatus) => {
      if (this.appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App ön plana geldi
        console.log('App resumed - triggering biometric verification');
        onResume();
        await this.verifyBiometricOnResume();
      } else if (nextAppState.match(/inactive|background/)) {
        // App arka plana gitti
        console.log('App paused');
        onPause();
      }
      this.appState.current = nextAppState;
    };
  };

  /**
   * On-Resume Verification Logic
   * App açılırken biyometrik doğrulama
   */
  async verifyBiometricOnResume() {
    try {
      this.biometricEnabled = await this.isBiometricEnabled();
      if (!this.biometricEnabled) return;

      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      if (!isAvailable) return;

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });

      this.isAuthenticated = result.success;
      if (!result.success) {
        console.warn('Biometric verification failed on resume');
      }
    } catch (error) {
      console.error('Biometric verification error:', error);
    }
  }

  /**
   * Screen Background Privacy Blur
   * Arka plana geçince ekranı bulanıklaştır
   */
  async enablePrivacyBlur() {
    try {
      // React Native'de native modül gerekli
      // Bu örnek için placeholder
      console.log('Privacy blur enabled');
      await AsyncStorage.setItem('privacyBlurEnabled', 'true');
    } catch (error) {
      console.error('Privacy blur error:', error);
    }
  }

  async disablePrivacyBlur() {
    try {
      console.log('Privacy blur disabled');
      await AsyncStorage.removeItem('privacyBlurEnabled');
    } catch (error) {
      console.error('Privacy blur error:', error);
    }
  }

  /**
   * Screenshot/Recording Prevention
   * Ekran görüntüsü ve kayıt engelleme (secure flags)
   */
  async enableScreenshotPrevention() {
    try {
      // Native modül gerekli - placeholder
      console.log('Screenshot prevention enabled');
      await AsyncStorage.setItem('screenshotPreventionEnabled', 'true');
    } catch (error) {
      console.error('Screenshot prevention error:', error);
    }
  }

  async disableScreenshotPrevention() {
    try {
      console.log('Screenshot prevention disabled');
      await AsyncStorage.removeItem('screenshotPreventionEnabled');
    } catch (error) {
      console.error('Screenshot prevention error:', error);
    }
  }

  /**
   * Biyometrik Durumu Kontrol Et
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Biyometrik Etkinleştir/Devre Dışı Bırak
   */
  async setBiometricEnabled(enabled: boolean) {
    try {
      if (enabled) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
      } else {
        await AsyncStorage.removeItem('biometricEnabled');
      }
      this.biometricEnabled = enabled;
    } catch (error) {
      console.error('Biometric setting error:', error);
    }
  }

  /**
   * Oturum Durumunu Kontrol Et
   */
  isSessionAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Oturum Sonlandır
   */
  async terminateSession() {
    this.isAuthenticated = false;
    await AsyncStorage.removeItem('sessionToken');
  }
}

/**
 * Hook: Lifecycle Observer'ı Kullan
 */
export function useSecurityLifecycle() {
  const securityManager = SecurityManager.getInstance();

  useEffect(() => {
    const unsubscribe = securityManager.setupLifecycleObserver(
      () => {
        console.log('Security: App resumed');
      },
      () => {
        console.log('Security: App paused');
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe.then((fn: any) => fn?.()).catch(() => {});
      }
    };
  }, []);
}
