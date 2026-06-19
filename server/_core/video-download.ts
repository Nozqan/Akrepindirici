import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const execAsync = promisify(exec);


  url: string;
  platform: VideoPlatform;
  quality?: VideoQuality;
  removeWatermark?: boolean;
}

  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  title?: string;
  error?: string;
}

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');
const QUALITY_MAP: Record<VideoQuality, string> = {
  '360p': 'worst',
  '480p': 'worstvideo[height<=480]+bestaudio/best[height<=480]',
  '720p': 'best[height<=720]',
  '1080p': 'best',
};

  static async ensureDownloadDir(): Promise<void> {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
  }

  static async downloadVideo(options: VideoDownloadOptions): Promise<DownloadResult> {
    try {
      await this.ensureDownloadDir();

      const { url, platform, quality = '720p', removeWatermark = true } = options;

      // Validate URL
      if (!this.isValidUrl(url, platform)) {
        return {
          success: false,
          error: `Geçersiz ${platform} linki`,
        };
      }

      // Build yt-dlp command
      const qualityFormat = QUALITY_MAP[quality] || QUALITY_MAP['720p'];
      const timestamp = Date.now();
      const outputTemplate = path.join(DOWNLOAD_DIR, `${platform}_${timestamp}_%(title)s.%(ext)s`);

      let command = `yt-dlp -f "${qualityFormat}" -o "${outputTemplate}"`;

      // Add watermark removal for TikTok and Instagram
      if (removeWatermark && (platform === 'tiktok' || platform === 'instagram')) {
        command += ' --no-watermarks';
      }

      // Add audio extraction for better quality
      command += ' --merge-output-format mp4';

      // Add the URL
      command += ` "${url}"`;

      console.log(`[VIDEO_DOWNLOAD] Starting download: ${platform} - ${url}`);
      console.log(`[VIDEO_DOWNLOAD] Command: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 1024 * 1024 * 100, // 100MB buffer
      });

      console.log(`[VIDEO_DOWNLOAD] Download completed`);
      console.log(`[VIDEO_DOWNLOAD] Output: ${stdout}`);

      // Find the downloaded file
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const downloadedFile = files
        .filter((f) => f.includes(`${platform}_${timestamp}`))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(DOWNLOAD_DIR, a));
          const statB = fs.statSync(path.join(DOWNLOAD_DIR, b));
          return statB.mtimeMs - statA.mtimeMs;
        })[0];

      if (!downloadedFile) {
        return {
          success: false,
          error: 'Video dosyası bulunamadı',
        };
      }

      const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
      const stats = fs.statSync(filePath);

      return {
        success: true,
        filePath,
        fileName: downloadedFile,
        fileSize: stats.size,
        title: downloadedFile.replace(/\.[^/.]+$/, ''),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[VIDEO_DOWNLOAD] Error: ${errorMessage}`);

      return {
        success: false,
        error: `Video indirme başarısız: ${errorMessage}`,
      };
    }
  }

  static async downloadVideoStream(
    options: VideoDownloadOptions
  ): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
    try {
      const qualityFormat = QUALITY_MAP[options.quality || '720p'] || QUALITY_MAP['720p'];
      const command = `yt-dlp -f "${qualityFormat}" -o - "${options.url}"`;

      console.log(`[VIDEO_STREAM] Starting stream download: ${options.platform}`);

      const { stdout } = await execAsync(command, {
        timeout: 300000,
        maxBuffer: 1024 * 1024 * 500, // 500MB buffer for streaming
        encoding: 'buffer',
      });

      return {
        success: true,
        buffer: stdout as Buffer,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[VIDEO_STREAM] Error: ${errorMessage}`);

      return {
        success: false,
        error: `Video stream indirme başarısız: ${errorMessage}`,
      };
    }
  }

  static async getVideoInfo(url: string, platform: VideoPlatform): Promise<{
    success: boolean;
    info?: {
      title: string;
      duration: number;
      uploader: string;
      thumbnail: string;
      formats: Array<{ format_id: string; height: number; fps: number }>;
    };
    error?: string;
  }> {
    try {
      if (!this.isValidUrl(url, platform)) {
        return {
          success: false,
          error: `Geçersiz ${platform} linki`,
        };
      }

      const command = `yt-dlp -j "${url}"`;
      const { stdout } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
      });

      const info = JSON.parse(stdout);

      return {
        success: true,
        info: {
          title: info.title || 'Bilinmiyor',
          duration: info.duration || 0,
          uploader: info.uploader || 'Bilinmiyor',
          thumbnail: info.thumbnail || '',
          formats: (info.formats || [])
            .filter((f: any) => f.height && f.fps)
            .map((f: any) => ({
              format_id: f.format_id,
              height: f.height,
              fps: f.fps,
            }))
            .slice(0, 10),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[VIDEO_INFO] Error: ${errorMessage}`);

      return {
        success: false,
        error: `Video bilgisi alınamadı: ${errorMessage}`,
      };
    }
  }

  static isValidUrl(url: string, platform: VideoPlatform): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      switch (platform) {
        case 'twitter':
          return hostname.includes('twitter.com') || hostname.includes('x.com');
        case 'tiktok':
          return hostname.includes('tiktok.com') || hostname.includes('vm.tiktok.com');
        case 'instagram':
          return hostname.includes('instagram.com') || hostname.includes('instagr.am');
        case 'youtube':
          return hostname.includes('youtube.com') || hostname.includes('youtu.be');
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  static async cleanupOldDownloads(maxAgeHours: number = 24): Promise<void> {
    try {
      if (!fs.existsSync(DOWNLOAD_DIR)) return;

      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      const files = fs.readdirSync(DOWNLOAD_DIR);
      for (const file of files) {
        const filePath = path.join(DOWNLOAD_DIR, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`[CLEANUP] Deleted old file: ${file}`);
        }
      }
    } catch (error) {
      console.error(`[CLEANUP] Error: ${error}`);
    }
  }
}
