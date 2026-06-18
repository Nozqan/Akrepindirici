import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BiometricManager } from '@/lib/biometric-manager';
import * as Haptics from 'expo-haptics';

export default function BiometricLockScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const available = await BiometricManager.isAvailable();
      setBiometricAvailable(available);

      if (available) {
        const enabled = await BiometricManager.isBiometricEnabled();
        if (enabled) {
          // Otomatik biyometrik doğrulama
          await authenticateWithBiometric();
        } else {
          // Biyometrik devre dışı, direkt geç
          router.replace('/(tabs)/home');
        }
      } else {
        // Biyometrik yok, direkt geç
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('Biometric check error:', err);
      router.replace('/(tabs)/home');
    }
  };

  const authenticateWithBiometric = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await BiometricManager.authenticate();

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)/home');
      } else {
        setError('Biyometrik doğrulama başarısız');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMsg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer className="p-6 justify-center items-center">
      <View className="gap-8 items-center w-full">
        {/* Logo */}
        <View className="items-center gap-4">
          <Text className="text-6xl">🦂</Text>
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Akrepindirici
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            Güvenli Video İndirme
          </Text>
        </View>

        {/* Biometric Status */}
        <View
          className="w-full p-6 rounded-lg gap-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          {isLoading ? (
            <View className="items-center gap-3">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.foreground }} className="font-semibold">
                Doğrulanıyor...
              </Text>
            </View>
          ) : error ? (
            <View className="gap-3">
              <Text className="text-center text-lg font-semibold" style={{ color: colors.error }}>
                ❌ {error}
              </Text>
              <TouchableOpacity
                onPress={authenticateWithBiometric}
                className="py-3 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.background }}>
                  Tekrar Dene
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center gap-3">
              <Text className="text-5xl">👆</Text>
              <Text style={{ color: colors.foreground }} className="font-semibold text-center">
                Parmak İzi ile Doğrulayın
              </Text>
              <Text style={{ color: colors.muted }} className="text-sm text-center">
                Uygulamaya erişmek için biyometrik doğrulama gereklidir
              </Text>
            </View>
          )}
        </View>

        {/* Authenticate Button */}
        {!isLoading && !error && (
          <TouchableOpacity
            onPress={authenticateWithBiometric}
            className="w-full py-4 rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-center font-bold text-lg" style={{ color: colors.background }}>
              Doğrula
            </Text>
          </TouchableOpacity>
        )}

        {/* Skip Button */}
        <TouchableOpacity onPress={handleSkip} className="w-full py-2">
          <Text className="text-center font-semibold" style={{ color: colors.muted }}>
            Atla
          </Text>
        </TouchableOpacity>

        {/* Security Info */}
        <View className="w-full gap-2 pt-4 border-t" style={{ borderColor: colors.border }}>
          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
            GÜVENLİK BİLGİSİ
          </Text>
          <Text className="text-xs leading-relaxed" style={{ color: colors.muted }}>
            Verileriniz cihazda şifreli olarak saklanır. Biyometrik bilgileriniz hiçbir zaman sunuculara gönderilmez.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
