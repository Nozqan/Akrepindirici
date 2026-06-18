import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'akrepindirici_biometric_enabled';
const BIOMETRIC_FALLBACK_KEY = 'akrepindirici_biometric_fallback';

export class BiometricManager {
  static async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  static async enableBiometric(): Promise<boolean> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return false;
      }
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      return true;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  }

  static async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  }

  static async authenticate(): Promise<boolean> {
    try {
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return true; // Skip if not enabled
      }

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  static async getSupportedAuthenticationTypes(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map(String);
    } catch (error) {
      console.error('Failed to get supported auth types:', error);
      return [];
    }
  }

  static async getAvailableAuthenticationTypes(): Promise<string[]> {
    try {
      const types = await this.getSupportedAuthenticationTypes();
      // For now, return generic biometric types
      return types.length > 0 ? ['Parmak İzi', 'Yüz Tanıma'] : [];
    } catch {
      return [];
    }
  }
}
