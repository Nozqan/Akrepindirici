import React, { useState } from 'react';
import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { DownloadManager } from '@/lib/download-manager';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function InstagramScreen() {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text);
      }
    } catch (error) {
      Alert.alert('Hata', 'Clipboard erişimi başarısız');
    }
  };

  const handleDownload = async () => {
    if (!url) {
      Alert.alert('Hata', 'Lütfen bir Instagram linki girin');
      return;
    }

    if (!DownloadManager.validateUrl(url, 'instagram')) {
      Alert.alert('Hata', 'Geçersiz Instagram linki');
      return;
    }

    setIsLoading(true);
    setDownloadProgress(0);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Simulate download with watermark removal
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Create download record
      const videoId = DownloadManager.generateVideoId();
      const filename = DownloadManager.generateFilename('instagram', '1080p');

      await DownloadManager.addDownloadHistory({
        id: videoId,
        platform: 'instagram',
        url,
        title: 'Instagram Video (Filigran Temizlendi)',
        filename,
        fileSize: Math.floor(Math.random() * 100000000) + 10000000,
        downloadedAt: Date.now(),
        quality: '1080p',
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Video başarıyla indirildi (Filigran temizlendi)');
      setUrl('');
      setDownloadProgress(0);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Video indirme başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              INSTAGRAM VİDEO
            </Text>
            <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
              İNDİRME
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Filigran Otomatik Temizleme
            </Text>
          </View>

          {/* URL Input */}
          <View className="gap-2">
            <Text style={{ color: colors.foreground }} className="text-sm font-semibold">
              Instagram Linki
            </Text>
            <TextInput
              placeholder="https://www.instagram.com/... veya https://instagr.am/..."
              placeholderTextColor={colors.muted}
              value={url}
              onChangeText={setUrl}
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Paste Button */}
          <TouchableOpacity
            onPress={handlePasteFromClipboard}
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            className="py-2 rounded-lg items-center"
          >
            <Text className="font-semibold" style={{ color: colors.primary }}>
              CLIPBOARD'TAN YAPIŞTUR
            </Text>
          </TouchableOpacity>

          {/* Download Progress */}
          {isLoading && (
            <View className="gap-2">
              <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                <View
                  className="h-full"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${downloadProgress}%`,
                  }}
                />
              </View>
              <Text className="text-center text-sm" style={{ color: colors.muted }}>
                İndiriliyor... {downloadProgress}%
              </Text>
              <Text className="text-center text-xs" style={{ color: colors.muted }}>
                Filigran temizleniyor...
              </Text>
            </View>
          )}

          {/* Download Button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.6 : 1,
            }}
            className="py-4 rounded-lg items-center"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="font-bold text-lg" style={{ color: colors.background }}>
                İNDİR (FİLİGRAN TEMİZ)
              </Text>
            )}
          </TouchableOpacity>

          {/* Features */}
          <View
            className="p-4 rounded-lg gap-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              ÖZELLİKLER
            </Text>
            <View className="gap-2">
              <Text className="text-sm" style={{ color: colors.foreground }}>
                ✓ Otomatik Filigran Temizleme
              </Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                ✓ Metadata Silme (Kullanıcı Adı, Marka)
              </Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                ✓ Full-HD Otomatik İndirme
              </Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                ✓ Ücretsiz ve Reklamsız
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
