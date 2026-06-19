import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

  url: string;
  quality: '360p' | '480p' | '720p' | '1080p';
  removeWatermark?: boolean;
  stripMetadata?: boolean;
}

  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  metadata?: TwitterMetadata;
  error?: string;
}

  tweetId: string;
  author: string;
  createdAt: string;
  text: string;
  likes: number;
  retweets: number;
  videoUrl?: string;
}

  private static readonly DOWNLOAD_DIR = '/tmp/twitter_downloads';
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
  ];

  static {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR, { recursive: true });
    }
  }

  static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  static async extractTweetId(url: string): Promise<string | null> {
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
      /twitter\.com\/\w+\/statuses\/(\d+)/,
      /x\.com\/\w+\/statuses\/(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  static async validateUrl(url: string): Promise<boolean> {
    try {
      const tweetId = await this.extractTweetId(url);
      if (!tweetId) return false;

      // Verify URL is accessible
      const response = await axios.head(url, {
        headers: { 'User-Agent': this.getRandomUserAgent() },
        timeout: 5000,
      });

      return response.status === 200 || response.status === 301 || response.status === 302;
    } catch (error) {
      console.error('[TWITTER] URL validation error:', error);
      return false;
    }
  }

  static async getMetadata(url: string): Promise<TwitterMetadata | null> {
    try {
      const tweetId = await this.extractTweetId(url);
      if (!tweetId) return null;

      // Use yt-dlp to extract metadata
      const command = `yt-dlp --dump-json "${url}" 2>/dev/null`;
      const output = execSync(command, { encoding: 'utf-8' });
      const data = JSON.parse(output);

      return {
        tweetId,
        author: data.uploader || 'Unknown',
        createdAt: data.upload_date || new Date().toISOString(),
        text: data.description || '',
        likes: data.like_count || 0,
        retweets: data.retweet_count || 0,
        videoUrl: data.url,
      };
    } catch (error) {
      console.error('[TWITTER] Metadata extraction error:', error);
      return null;
    }
  }

  static async download(options: TwitterDownloadOptions): Promise<DownloadResult> {
    try {
      const { url, quality, removeWatermark = true, stripMetadata = true } = options;

      console.log(`[TWITTER] Starting download: ${url}`);

      // Validate URL
      const isValid = await this.validateUrl(url);
      if (!isValid) {
        return { success: false, error: 'Geçersiz Twitter URL' };
      }

      // Extract tweet ID
      const tweetId = await this.extractTweetId(url);
      if (!tweetId) {
        return { success: false, error: 'Tweet ID çıkarılamadı' };
      }

      // Get metadata
      const metadata = await this.getMetadata(url);

      // Map quality to format
      const qualityMap: Record<string, string> = {
        '360p': 'worst',
        '480p': 'worse',
        '720p': 'best',
        '1080p': 'best',
      };

      const format = qualityMap[quality] || 'best';
      const fileName = `twitter_${tweetId}_${Date.now()}.mp4`;
      const filePath = path.join(this.DOWNLOAD_DIR, fileName);

      // Build yt-dlp command
      let command = `yt-dlp -f "${format}" -o "${filePath}" "${url}"`;

      // Add options
      if (removeWatermark) {
        command += ' --postprocessor-args "-vf delogo=x=0:y=0:w=100:h=100"';
      }

      if (stripMetadata) {
        command += ' --no-mtime';
      }

      // Execute download
      console.log(`[TWITTER] Executing: ${command}`);
      execSync(command, { encoding: 'utf-8' });

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'İndirme başarısız - dosya oluşturulamadı' };
      }

      const stats = fs.statSync(filePath);

      console.log(`[TWITTER] Download successful: ${fileName} (${stats.size} bytes)`);

      return {
        success: true,
        filePath,
        fileName,
        fileSize: stats.size,
        metadata: metadata || undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[TWITTER] Download error: ${errorMsg}`);

      return {
        success: false,
        error: `İndirme hatası: ${errorMsg}`,
      };
    }
  }

  static async downloadWithRetry(
    options: TwitterDownloadOptions,
    maxRetries: number = 3
  ): Promise<DownloadResult> {
    let lastError: DownloadResult | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[TWITTER] Download attempt ${attempt}/${maxRetries}`);

      const result = await this.download(options);

      if (result.success) {
        return result;
      }

      lastError = result;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[TWITTER] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return lastError || { success: false, error: 'Maksimum deneme sayısı aşıldı' };
  }

  static async cleanupOldFiles(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = fs.readdirSync(this.DOWNLOAD_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.DOWNLOAD_DIR, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`[TWITTER] Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('[TWITTER] Cleanup error:', error);
    }
  }
}
