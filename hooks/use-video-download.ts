import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface DownloadProgress {
  isDownloading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export function useVideoDownload() {
  const [progress, setProgress] = useState<DownloadProgress>({
    isDownloading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const downloadMutation = trpc.video.download.useMutation({
    onSuccess: () => {
      setProgress({
        isDownloading: false,
        progress: 100,
        error: null,
        success: true,
      });
    },
    onError: (error) => {
      setProgress({
        isDownloading: false,
        progress: 0,
        error: error.message,
        success: false,
      });
    },
  });

  const getInfoQuery = trpc.video.getInfo.useQuery;
  const validateUrlQuery = trpc.video.validateUrl.useQuery;

  const download = useCallback(
    async (url: string, platform: 'twitter' | 'tiktok' | 'instagram' | 'youtube', quality = '720p') => {
      setProgress({
        isDownloading: true,
        progress: 10,
        error: null,
        success: false,
      });

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + Math.random() * 20, 90),
          }));
        }, 500);

        await downloadMutation.mutateAsync({
          url,
          platform: platform as any,
          quality: quality as any,
          removeWatermark: true,
        });

        clearInterval(progressInterval);
      } catch (error) {
        setProgress({
          isDownloading: false,
          progress: 0,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          success: false,
        });
      }
    },
    [downloadMutation]
  );

  const getVideoInfo = useCallback(
    (url: string, platform: 'twitter' | 'tiktok' | 'instagram' | 'youtube') => {
      return getInfoQuery({ url, platform: platform as any });
    },
    [getInfoQuery]
  );

  const validateUrl = useCallback(
    (url: string, platform: 'twitter' | 'tiktok' | 'instagram' | 'youtube') => {
      return validateUrlQuery({ url, platform: platform as any });
    },
    [validateUrlQuery]
  );

  return {
    download,
    getVideoInfo,
    validateUrl,
    progress,
    isLoading: downloadMutation.isPending,
  };
}
