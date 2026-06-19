import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const videoData = {
    title: (Array.isArray(params.title) ? params.title[0] : params.title) || 'Video Başlığı',
    platform: (Array.isArray(params.platform) ? params.platform[0] : params.platform) || 'Twitter',
    size: (Array.isArray(params.size) ? params.size[0] : params.size) || '25.5 MB',
    duration: (Array.isArray(params.duration) ? params.duration[0] : params.duration) || '2:34',
    uploadedBy: (Array.isArray(params.uploadedBy) ? params.uploadedBy[0] : params.uploadedBy) || 'Kullanıcı Adı',
    downloadDate: (Array.isArray(params.downloadDate) ? params.downloadDate[0] : params.downloadDate) || new Date().toLocaleDateString('tr-TR'),
    quality: (Array.isArray(params.quality) ? params.quality[0] : params.quality) || '1080p',
    fileUri: (Array.isArray(params.fileUri) ? params.fileUri[0] : params.fileUri) || '',
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      if (videoData.fileUri && (await FileSystem.getInfoAsync(videoData.fileUri)).exists) {
        await Sharing.shareAsync(videoData.fileUri);
      } else {
        Alert.alert('Hata', 'Dosya bulunamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Sil',
      'Bu videoyu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', onPress: () => {} },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              if (videoData.fileUri) {
                await FileSystem.deleteAsync(videoData.fileUri);
              }
              router.back();
            } catch (error) {
              Alert.alert('Hata', 'Silme işlemi başarısız');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Başlık */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-lg text-primary">← Geri</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">{videoData.title}</Text>
          <Text className="text-sm text-muted">{videoData.platform} Videosu</Text>
        </View>

        {/* Video Bilgileri */}
        <View className="bg-surface rounded-2xl p-4 mb-6">
          <View className="mb-4 pb-4 border-b border-border">
            <Text className="text-xs text-muted uppercase mb-1">Platform</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.platform}</Text>
          </View>

          <View className="mb-4 pb-4 border-b border-border">
            <Text className="text-xs text-muted uppercase mb-1">Kalite</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.quality}</Text>
          </View>

          <View className="mb-4 pb-4 border-b border-border">
            <Text className="text-xs text-muted uppercase mb-1">Dosya Boyutu</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.size}</Text>
          </View>

          <View className="mb-4 pb-4 border-b border-border">
            <Text className="text-xs text-muted uppercase mb-1">Süre</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.duration}</Text>
          </View>

          <View className="mb-4 pb-4 border-b border-border">
            <Text className="text-xs text-muted uppercase mb-1">Yükleme Tarihi</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.downloadDate}</Text>
          </View>

          <View>
            <Text className="text-xs text-muted uppercase mb-1">Yükleyen</Text>
            <Text className="text-lg font-semibold text-foreground">{videoData.uploadedBy}</Text>
          </View>
        </View>

        {/* İstatistikler */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-xl p-3">
            <Text className="text-xs text-muted mb-1">Toplam İndirmeler</Text>
            <Text className="text-2xl font-bold text-primary">1</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-3">
            <Text className="text-xs text-muted mb-1">Paylaşımlar</Text>
            <Text className="text-2xl font-bold text-primary">0</Text>
          </View>
        </View>

        {/* Butonlar */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleShare}
            disabled={loading}
            className="bg-primary rounded-xl py-3 px-4 active:opacity-80"
          >
            <Text className="text-center text-white font-semibold text-lg">
              {loading ? 'Paylaşılıyor...' : '📤 Paylaş'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="bg-error rounded-xl py-3 px-4 active:opacity-80"
          >
            <Text className="text-center text-white font-semibold text-lg">🗑️ Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface rounded-xl py-3 px-4 border border-border active:opacity-80"
          >
            <Text className="text-center text-foreground font-semibold text-lg">Kapat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
