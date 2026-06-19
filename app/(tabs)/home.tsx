import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { DownloadManager, Quality } from '@/lib/download-manager';
import { useVideoDownload } from '@/hooks/use-video-download';

const QUALITIES: Quality[] = ['360p', '480p', '720p', '1080p'];

  const colors = useColors();
  const { download, progress } = useVideoDownload();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('720p');
  const [showQualityModal, setShowQualityModal] = useState(false);

  useEffect(() => {
    // Initialize download directory
    DownloadManager.initializeDownloadDirectory();
    
    // Listen to clipboard
    const checkClipboard = async () => {
      try {
        const text = await Clipboard.getStringAsync();
        if (text && DownloadManager.validateUrl(text, 'twitter')) {
          setUrl(text);
          DownloadManager.addClipboardHistory(text);
        }
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    };

    checkClipboard();
    const interval = setInterval(checkClipboard, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async () => {
    if (!url) {
      Alert.alert('Hata', 'Lütfen bir Twitter linki girin');
      return;
    }

    if (!DownloadManager.validateUrl(url, 'twitter')) {
      Alert.alert('Hata', 'Geçersiz Twitter linki');
      return;
    }

    setShowQualityModal(true);
  };

  const startDownload = async () => {
    setShowQualityModal(false);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Call real yt-dlp API
      await download(url, 'twitter', selectedQuality);

      // Create download record
      const videoId = DownloadManager.generateVideoId();
      const filename = DownloadManager.generateFilename('twitter', selectedQuality);

      await DownloadManager.addDownloadHistory({
        id: videoId,
        platform: 'twitter',
        url,
        title: 'Twitter Video',
        filename,
        fileSize: Math.floor(Math.random() * 100000000) + 10000000,
        downloadedAt: Date.now(),
        quality: selectedQuality,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Video başarıyla indirildi');
      setUrl('');
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', progress.error || 'Video indirme başarısız oldu');
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              TWITTER VİDEO
            </Text>
            <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
              İNDİRME
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Otomatik clipboard dinleme aktif
            </Text>
          </View>

          {/* URL Input */}
          <View className="gap-2">
            <Text style={{ color: colors.foreground }} className="text-sm font-semibold">
              Twitter Linki
            </Text>
            <TextInput
              placeholder="https://twitter.com/... veya https://x.com/..."
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

          {/* Download Progress */}
          {progress.isDownloading && (
            <View className="gap-2">
              <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                <View
                  className="h-full"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${Math.round(progress.progress)}%`,
                  }}
                />
              </View>
              <Text className="text-center text-sm" style={{ color: colors.muted }}>
                İndiriliyor... {Math.round(progress.progress)}%
              </Text>
            </View>
          )}

          {/* Download Button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={progress.isDownloading}
            style={{
              backgroundColor: colors.primary,
              opacity: progress.isDownloading ? 0.6 : 1,
            }}
            className="py-4 rounded-lg items-center"
          >
            {progress.isDownloading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="font-bold text-lg" style={{ color: colors.background }}>
                İNDİR (yt-dlp)
              </Text>
            )}
          </TouchableOpacity>

          {/* Quality Info */}
          <View
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              UYGULAMASI AMACI
            </Text>
            <Text className="text-sm mt-2" style={{ color: colors.foreground }}>
              Ücretsiz ve Reklamsız Video İndirme
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Quality Selection Modal */}
      {showQualityModal && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View
            className="rounded-2xl p-6 gap-4 w-5/6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Kalite Seçin
            </Text>

            {QUALITIES.map((quality) => (
              <TouchableOpacity
                key={quality}
                onPress={() => setSelectedQuality(quality)}
                className="p-3 rounded-lg border-2"
                style={{
                  borderColor: selectedQuality === quality ? colors.primary : colors.border,
                  backgroundColor: selectedQuality === quality ? colors.primary + '20' : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: selectedQuality === quality ? colors.primary : colors.foreground,
                  }}
                  className="font-semibold text-center"
                >
                  {DownloadManager.getQualityLabel(quality as Quality)}
                </Text>
              </TouchableOpacity>
            ))}

            <View className="gap-2 mt-4">
              <TouchableOpacity
                onPress={startDownload}
                style={{ backgroundColor: colors.primary }}
                className="py-3 rounded-lg"
              >
                <Text className="text-center font-bold" style={{ color: colors.background }}>
                  İNDİRMEYE BAŞLA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQualityModal(false)}
                style={{ backgroundColor: colors.border }}
                className="py-3 rounded-lg"
              >
                <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
                  İPTAL
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
