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
  metadata?: InstagramMetadata;
  error?: string;
}

  postId: string;
  author: string;
  authorHandle: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
  isReel: boolean;
}

  private static readonly DOWNLOAD_DIR = '/tmp/instagram_downloads';
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Instagram 1.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Instagram 1.0',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 Instagram 1.0',
  ];

  static {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR, { recursive: true });
    }
  }

  static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  static async extractPostId(url: string): Promise<string | null> {
    const patterns = [
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
      /instagr\.am\/p\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  static async validateUrl(url: string): Promise<boolean> {
    try {
      const postId = await this.extractPostId(url);
      if (!postId) return false;

      const response = await axios.head(url, {
        headers: { 'User-Agent': this.getRandomUserAgent() },
        timeout: 5000,
        maxRedirects: 5,
      });

      return response.status === 200 || response.status === 301 || response.status === 302;
    } catch (error) {
      console.error('[INSTAGRAM] URL validation error:', error);
      return false;
    }
  }

  static async getMetadata(url: string): Promise<InstagramMetadata | null> {
    try {
      const postId = await this.extractPostId(url);
      if (!postId) return null;

      const command = `yt-dlp --dump-json "${url}" 2>/dev/null`;
      const output = execSync(command, { encoding: 'utf-8' });
      const data = JSON.parse(output);

      const isReel = url.includes('/reel/');

      return {
        postId,
        author: data.uploader || 'Unknown',
        authorHandle: data.uploader_id || '@unknown',
        caption: data.description || '',
        likes: data.like_count || 0,
        comments: data.comment_count || 0,
        createdAt: data.upload_date || new Date().toISOString(),
        isReel,
      };
    } catch (error) {
      console.error('[INSTAGRAM] Metadata extraction error:', error);
      return null;
    }
  }

  static async removeWatermark(filePath: string): Promise<boolean> {
    try {
      console.log(`[INSTAGRAM] Removing watermark from: ${filePath}`);

      // Instagram watermark is typically in bottom-right corner
      const tempPath = filePath + '.temp.mp4';
      const command = `ffmpeg -i "${filePath}" -vf "drawbox=x=iw-150:y=ih-50:w=150:h=50:color=black:t=fill" -c:a copy "${tempPath}" 2>/dev/null && mv "${tempPath}" "${filePath}"`;

      execSync(command);
      console.log(`[INSTAGRAM] Watermark removed successfully`);

      return true;
    } catch (error) {
      console.error('[INSTAGRAM] Watermark removal error:', error);
      return false;
    }
  }

  static async stripMetadata(filePath: string): Promise<boolean> {
    try {
      console.log(`[INSTAGRAM] Stripping metadata from: ${filePath}`);

      // Strip all metadata including EXIF
      const tempPath = filePath + '.temp.mp4';
      const command = `ffmpeg -i "${filePath}" -c copy -map_metadata -1 -map_chapters -1 "${tempPath}" 2>/dev/null && mv "${tempPath}" "${filePath}"`;

      execSync(command);
      console.log(`[INSTAGRAM] Metadata stripped successfully`);

      return true;
    } catch (error) {
      console.error('[INSTAGRAM] Metadata stripping error:', error);
      return false;
    }
  }

  static async download(options: InstagramDownloadOptions): Promise<DownloadResult> {
    try {
      const { url, quality, removeWatermark = true, stripMetadata = true } = options;

      console.log(`[INSTAGRAM] Starting download: ${url}`);

      // Validate URL
      const isValid = await this.validateUrl(url);
      if (!isValid) {
        return { success: false, error: 'Geçersiz Instagram URL' };
      }

      // Extract post ID
      const postId = await this.extractPostId(url);
      if (!postId) {
        return { success: false, error: 'Post ID çıkarılamadı' };
      }

      // Get metadata
      const metadata = await this.getMetadata(url);

      // Map quality
      const qualityMap: Record<string, string> = {
        '360p': 'worst',
        '480p': 'worse',
        '720p': 'best',
        '1080p': 'best',
      };

      const format = qualityMap[quality] || 'best';
      const fileName = `instagram_${postId}_${Date.now()}.mp4`;
      const filePath = path.join(this.DOWNLOAD_DIR, fileName);

      // Build yt-dlp command with Instagram-specific headers
      let command = `yt-dlp -f "${format}" -o "${filePath}" "${url}"`;

      // Execute download
      console.log(`[INSTAGRAM] Executing download...`);
      execSync(command, { encoding: 'utf-8' });

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'İndirme başarısız' };
      }

      // Post-processing
      if (removeWatermark) {
        await this.removeWatermark(filePath);
      }

      if (stripMetadata) {
        await this.stripMetadata(filePath);
      }

      const stats = fs.statSync(filePath);

      console.log(`[INSTAGRAM] Download successful: ${fileName} (${stats.size} bytes)`);

      return {
        success: true,
        filePath,
        fileName,
        fileSize: stats.size,
        metadata: metadata || undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[INSTAGRAM] Download error: ${errorMsg}`);

      return {
        success: false,
        error: `İndirme hatası: ${errorMsg}`,
      };
    }
  }

  static async downloadWithRetry(
    options: InstagramDownloadOptions,
    maxRetries: number = 3
  ): Promise<DownloadResult> {
    let lastError: DownloadResult | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[INSTAGRAM] Download attempt ${attempt}/${maxRetries}`);

      const result = await this.download(options);

      if (result.success) {
        return result;
      }

      lastError = result;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[INSTAGRAM] Retrying in ${delay}ms...`);
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
          console.log(`[INSTAGRAM] Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('[INSTAGRAM] Cleanup error:', error);
    }
  }
}
