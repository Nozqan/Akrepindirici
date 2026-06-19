import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { DownloadManager, type DownloadedVideo } from '@/lib/download-manager';
import { ShareManager, type ShareTarget } from '@/lib/share-manager';

type TabType = 'twitter' | 'tiktok' | 'instagram';

  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('twitter');
  const [videos, setVideos] = useState<DownloadedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<DownloadedVideo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleShare = (video: DownloadedVideo) => {
    setSelectedVideo(video);
    setShowShareModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleShareToTarget = async (target: ShareTarget) => {
    if (!selectedVideo) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (target.id) {
        case 'whatsapp':
          await ShareManager.shareToWhatsApp({
            videoUrl: selectedVideo.filename,
            fileName: selectedVideo.filename,
            platform: activeTab,
            title: selectedVideo.title,
          });
          break;
        case 'telegram':
          await ShareManager.shareToTelegram({
            videoUrl: selectedVideo.filename,
            fileName: selectedVideo.filename,
            platform: activeTab,
            title: selectedVideo.title,
          });
          break;
        case 'email':
          await ShareManager.shareViaEmail({
            videoUrl: selectedVideo.filename,
            fileName: selectedVideo.filename,
            platform: activeTab,
            title: selectedVideo.title,
          });
          break;
        case 'copy':
          const copied = await ShareManager.copyLinkToClipboard(selectedVideo.filename);
          if (copied) {
            Alert.alert('Basarili', 'Link clipboard a kopyalandi');
          }
          break;
        default:
          await ShareManager.shareVideo({
            videoUrl: selectedVideo.filename,
            fileName: selectedVideo.filename,
            platform: activeTab,
            title: selectedVideo.title,
          });
      }

      setShowShareModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım başarısız oldu');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

          {/* Videos List */}
          {loading ? (
            <View className="items-center justify-center py-8">
              <Text style={{ color: colors.muted }}>Yükleniyor...</Text>
            </View>
          ) : videos.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Henüz video indirilmedi
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {videos.map((video) => (
                <View
                  key={video.id}
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
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity
                        onPress={() => handleShare(video)}
                        className="flex-1 py-2 rounded"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text
                          className="text-center text-xs font-semibold"
                          style={{ color: colors.background }}
                        >
                          📤 Paylaş
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(video.id)}
                        className="flex-1 py-2 rounded"
                        style={{ backgroundColor: colors.error }}
                      >
                        <Text
                          className="text-center text-xs font-semibold"
                          style={{ color: colors.background }}
                        >
                          🗑️ Sil
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View
            className="rounded-t-3xl p-6 gap-4"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="items-center gap-2 mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Paylaş
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {selectedVideo?.title}
              </Text>
            </View>

            {/* Share Options */}
            <View className="gap-2">
              {ShareManager.SHARE_TARGETS.map((target) => (
                <TouchableOpacity
                  key={target.id}
                  onPress={() => handleShareToTarget(target)}
                  className="p-4 rounded-lg flex-row items-center gap-3"
                                    style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Text className="text-2xl">{target.icon}</Text>
                  <Text className="flex-1 font-semibold" style={{ color: colors.foreground }}>
                    {target.name}
                  </Text>
                  <Text style={{ color: colors.muted }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowShareModal(false)}
              className="p-4 rounded-lg mt-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.background }}>
                Kapat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
