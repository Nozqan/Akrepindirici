import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { ThemeManager, ThemeName } from '@/lib/theme-manager';
import { BiometricManager } from '@/lib/biometric-manager';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const colors = useColors();
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('jetBlack');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [amoledMode, setAmoledMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await ThemeManager.getCurrentTheme();
      setCurrentTheme(theme);

      const biometricEnabled = await BiometricManager.isBiometricEnabled();
      setBiometricEnabled(biometricEnabled);

      const available = await BiometricManager.isAvailable();
      setBiometricAvailable(available);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (theme: ThemeName) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await ThemeManager.setTheme(theme);
      setCurrentTheme(theme);
    } catch (error) {
      Alert.alert('Hata', 'Tema değiştirilemedi');
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        if (!biometricAvailable) {
          Alert.alert('Hata', 'Bu cihazda biyometrik doğrulama mevcut değil');
          return;
        }
        const success = await BiometricManager.enableBiometric();
        if (success) {
          setBiometricEnabled(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        await BiometricManager.disableBiometric();
        setBiometricEnabled(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'Biyometrik ayarı değiştirilemedi');
    }
  };

  const themes: ThemeName[] = ['jetBlack', 'midnightBlue', 'emerald', 'ruby', 'nebiSpecial'];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              AYARLAR
            </Text>
          </View>

          {/* Creator Info */}
          <View
            className="p-4 rounded-lg gap-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              KURUCU
            </Text>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Nebi Özkan
            </Text>
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              UYGULAMA AMACI
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              Ücretsiz ve Reklamsız Video İndirme
            </Text>
            <View className="border-t mt-3 pt-3" style={{ borderColor: colors.border }}>
              <Text className="text-xs text-center" style={{ color: colors.muted }}>
                Sürüm v2.2.50zkan
              </Text>
              <Text className="text-xs text-center" style={{ color: colors.muted }}>
                © 2026 Nebi Özkan
              </Text>
            </View>
          </View>

          {/* Security Settings */}
          <View className="gap-3">
            <Text className="text-sm font-bold" style={{ color: colors.foreground }}>
              GÜVENLİK VE ERİŞİM
            </Text>

            {/* Biometric Lock */}
            <View
              className="p-4 rounded-lg flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: colors.foreground }} className="font-semibold flex-1">
                Parmak İzi Kilidi
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={biometricEnabled ? colors.primary : colors.muted}
              />
            </View>

            {/* AMOLED Dark Mode */}
            <View
              className="p-4 rounded-lg flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: colors.foreground }} className="font-semibold flex-1">
                Karanlık Mod (AMOLED)
              </Text>
              <Switch
                value={amoledMode}
                onValueChange={(value) => {
                  setAmoledMode(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={amoledMode ? colors.primary : colors.muted}
              />
            </View>

            {/* 2K Background */}
            <View
              className="p-4 rounded-lg flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: colors.foreground }} className="font-semibold flex-1">
                2K Arka Plan Resimleri
              </Text>
              <Switch
                value={true}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={colors.primary}
              />
            </View>
          </View>

          {/* Theme Selection */}
          <View className="gap-3">
            <Text className="text-sm font-bold" style={{ color: colors.foreground }}>
              KİŞİSELLEŞTİRME - TEMA SEÇİMİ
            </Text>

            <View className="gap-2">
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={() => handleThemeChange(theme)}
                  className="p-4 rounded-lg border-2"
                  style={{
                    borderColor: currentTheme === theme ? colors.primary : colors.border,
                    backgroundColor: currentTheme === theme ? colors.primary + '20' : colors.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      style={{
                        color: currentTheme === theme ? colors.primary : colors.foreground,
                      }}
                      className="font-semibold text-base"
                    >
                      {ThemeManager.getThemeLabel(theme)}
                    </Text>
                    {currentTheme === theme && (
                      <View
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* About */}
          <View
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              HAKKINDA
            </Text>
            <Text className="text-sm mt-2 leading-relaxed" style={{ color: colors.foreground }}>
              Akrepindirici, Twitter, TikTok ve Instagram'dan video indirmeyi kolaylaştıran, güvenli ve
              kullanıcı dostu bir uygulamadır.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
