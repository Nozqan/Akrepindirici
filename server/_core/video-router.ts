import { router, publicProcedure } from './trpc';
import { z } from 'zod';
import { VideoDownloadService, type VideoPlatform, type VideoQuality } from './video-download';

  download: publicProcedure
    .input(
      z.object({
        url: z.string().url('Geçersiz URL'),
        platform: z.enum(['twitter', 'tiktok', 'instagram', 'youtube']),
        quality: z.enum(['360p', '480p', '720p', '1080p']).default('720p'),
        removeWatermark: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      console.log(`[VIDEO_ROUTER] Download request: ${input.platform} - ${input.url}`);

      const result = await VideoDownloadService.downloadVideo({
        url: input.url,
        platform: input.platform as VideoPlatform,
        quality: input.quality as VideoQuality,
        removeWatermark: input.removeWatermark,
      });

      if (!result.success) {
        throw new Error(result.error || 'Video indirme başarısız');
      }

      return {
        success: true,
        fileName: result.fileName,
        fileSize: result.fileSize,
        title: result.title,
        downloadUrl: `/api/video/download/${result.fileName}`,
      };
    }),

  getInfo: publicProcedure
    .input(
      z.object({
        url: z.string().url('Geçersiz URL'),
        platform: z.enum(['twitter', 'tiktok', 'instagram', 'youtube']),
      })
    )
    .query(async ({ input }) => {
      console.log(`[VIDEO_ROUTER] Info request: ${input.platform} - ${input.url}`);

      const result = await VideoDownloadService.getVideoInfo(input.url, input.platform as VideoPlatform);

      if (!result.success) {
        throw new Error(result.error || 'Video bilgisi alınamadı');
      }

      return result.info;
    }),

  validateUrl: publicProcedure
    .input(
      z.object({
        url: z.string().url('Geçersiz URL'),
        platform: z.enum(['twitter', 'tiktok', 'instagram', 'youtube']),
      })
    )
    .query(({ input }) => {
      const isValid = VideoDownloadService.isValidUrl(input.url, input.platform as VideoPlatform);
      return { isValid };
    }),

  cleanup: publicProcedure.mutation(async () => {
    await VideoDownloadService.cleanupOldDownloads(24);
    return { success: true };
  }),
});
