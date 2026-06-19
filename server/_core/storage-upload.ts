import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

  filePath: string;
  fileName: string;
  platform: 'twitter' | 'tiktok' | 'instagram' | 'youtube';
  contentType?: string;
}

  success: boolean;
  url?: string;
  error?: string;
  fileSize?: number;
}

  private static readonly STORAGE_API = process.env.STORAGE_API_URL || 'http://localhost:3000/api/storage';
  private static readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  static async uploadVideoToStorage(options: UploadOptions): Promise<UploadResult> {
    try {
      const { filePath, fileName, platform, contentType = 'video/mp4' } = options;

      // Validate file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'Dosya bulunamadı',
        };
      }

      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Dosya çok büyük (Max: 500MB, Current: ${(stats.size / 1024 / 1024).toFixed(2)}MB)`,
        };
      }

      console.log(`[STORAGE_UPLOAD] Uploading ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);

      // Read file
      const fileBuffer = fs.readFileSync(filePath);

      // Create FormData
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: contentType }), fileName);
      formData.append('platform', platform);
      formData.append('metadata', JSON.stringify({
        uploadedAt: new Date().toISOString(),
        originalSize: stats.size,
        platform,
      }));

      // Upload to storage API
      const response = await axios.post(`${this.STORAGE_API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`[STORAGE_UPLOAD] Progress: ${percentCompleted}%`);
        },
      });

      if (response.data.success && response.data.url) {
        console.log(`[STORAGE_UPLOAD] Upload successful: ${response.data.url}`);

        // Delete local file after successful upload
        try {
          fs.unlinkSync(filePath);
          console.log(`[STORAGE_UPLOAD] Local file deleted: ${filePath}`);
        } catch (err) {
          console.warn(`[STORAGE_UPLOAD] Could not delete local file: ${err}`);
        }

        return {
          success: true,
          url: response.data.url,
          fileSize: stats.size,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Yükleme başarısız',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[STORAGE_UPLOAD] Error: ${errorMessage}`);

      return {
        success: false,
        error: `Yükleme hatası: ${errorMessage}`,
      };
    }
  }

  static async uploadMultipleVideos(
    files: UploadOptions[]
  ): Promise<Array<UploadResult & { fileName: string }>> {
    const results = await Promise.all(
      files.map(async (file) => ({
        fileName: file.fileName,
        ...(await this.uploadVideoToStorage(file)),
      }))
    );

    return results;
  }

  static async deleteFromStorage(fileUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(`${this.STORAGE_API}/delete`, {
        url: fileUrl,
      });

      if (response.data.success) {
        console.log(`[STORAGE_DELETE] File deleted: ${fileUrl}`);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.error || 'Silme başarısız',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[STORAGE_DELETE] Error: ${errorMessage}`);

      return {
        success: false,
        error: `Silme hatası: ${errorMessage}`,
      };
    }
  }

  static generateStorageUrl(fileName: string, platform: string): string {
    const timestamp = Date.now();
    return `${this.STORAGE_API}/download/${platform}/${timestamp}/${fileName}`;
  }
}
