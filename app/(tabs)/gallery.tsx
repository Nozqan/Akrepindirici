import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { DownloadManager, Platform as DlPlatform, DownloadedVideo } from '@/lib/download-manager';
import * as Haptics from 'expo-haptics';

type TabType = 'twitter' | 'tiktok' | 'instagram';

export default function GalleryScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('twitter');
  const [videos, setVideos] = useState<DownloadedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [activeTab]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const history = await DownloadManager.getDownloadHistory(activeTab);
      setVideos(history);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (videoId: string) => {
    Alert.alert('Sil', 'Bu videoyu silmek istediğinizden emin misiniz?', [
      { text: 'İptal', onPress: () => {} },
      {
        text: 'Sil',
        onPress: async () => {
          try {
            await DownloadManager.deleteDownload(videoId);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadVideos();
          } catch (error) {
            Alert.alert('Hata', 'Video silinemedi');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'twitter', label: 'Twitter' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'instagram', label: 'Instagram' },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              İNDİRİLENLER
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {videos.length} video
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 py-2 rounded-lg border"
                style={{
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                  borderColor: activeTab === tab.key ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-center font-semibold text-sm"
                  style={{
                    color: activeTab === tab.key ? colors.background : colors.foreground,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Videos Grid */}
          {loading ? (
            <View className="items-center justify-center py-8">
              <Text style={{ color: colors.muted }}>Yükleniyor...</Text>
            </View>
          ) : videos.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Henüz video indirilmedi
              </Text>
              <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                {activeTab === 'twitter' ? 'Twitter' : activeTab === 'tiktok' ? 'TikTok' : 'Instagram'} sekmesine
                gidin
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onLongPress={() => handleDelete(video.id)}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <View className="gap-2">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text
                          className="font-semibold text-sm"
                          style={{ color: colors.foreground }}
                          numberOfLines={1}
                        >
                          {video.title}
                        </Text>
                        <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                          {formatDate(video.downloadedAt)}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: colors.primary + '20' }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                          {video.quality}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        {formatFileSize(video.fileSize)}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        Sil için uzun basın
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
