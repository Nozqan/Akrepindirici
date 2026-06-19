import AsyncStorage from '@react-native-async-storage/async-storage';

  id: string;
  title: string;
  platform: 'twitter' | 'tiktok' | 'instagram';
  fileUri: string;
  thumbnailUri?: string;
  size: number;
  duration: number;
  quality: string;
  downloadedAt: number;
  uploadedBy?: string;
}

  private static instance: DataManager;
  private thumbnailCache = new Map<string, string>();
  private readonly CACHE_DIR = FileSystem.cacheDirectory + 'akrepindirici_cache/';
  private readonly THUMBNAIL_DIR = FileSystem.cacheDirectory + 'akrepindirici_thumbs/';
  private readonly METADATA_KEY = 'akrepindirici_metadata';
  private readonly MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

  private constructor() {
    this.initializeCacheDirectories();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Cache Dizinlerini Başlat
   */
  private async initializeCacheDirectories() {
    try {
      const cacheInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!cacheInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }

      const thumbInfo = await FileSystem.getInfoAsync(this.THUMBNAIL_DIR);
      if (!thumbInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.THUMBNAIL_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Cache directory initialization error:', error);
    }
  }

  /**
   * Thumbnail Caching - Bellek Verimli
   */
  async cacheThumbnail(videoId: string, sourceUri: string): Promise<string> {
    try {
      // Eğer cache'de varsa, döndür
      if (this.thumbnailCache.has(videoId)) {
        return this.thumbnailCache.get(videoId)!;
      }

      // Yeni thumbnail'i cache'e kopyala
      const hashedId = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, videoId);
      const cachedPath = this.THUMBNAIL_DIR + `thumb_${hashedId.substring(0, 16)}.jpg`;

      // Dosya varsa, cache'e ekle
      const fileInfo = await FileSystem.getInfoAsync(sourceUri);
      if (fileInfo.exists) {
        await FileSystem.copyAsync({
          from: sourceUri,
          to: cachedPath,
        });
        this.thumbnailCache.set(videoId, cachedPath);
        return cachedPath;
      }

      return sourceUri;
    } catch (error) {
      console.error('Thumbnail caching error:', error);
      return sourceUri;
    }
  }

  /**
   * Encrypted File Path Management
   * Dosya yollarını şifrele
   */
  async encryptFilePath(filePath: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, filePath);
      return digest;
    } catch (error) {
      console.error('File path encryption error:', error);
      return filePath;
    }
  }

  /**
   * Video Metadata Kaydet
   */
  async saveVideoMetadata(metadata: VideoMetadata) {
    try {
      const allMetadata = await this.getAllVideoMetadata();
      allMetadata.push(metadata);
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('Save metadata error:', error);
    }
  }

  /**
   * Tüm Video Metadata'sını Al
   */
  async getAllVideoMetadata(): Promise<VideoMetadata[]> {
    try {
      const data = await AsyncStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get metadata error:', error);
      return [];
    }
  }

  /**
   * Platform Bazlı Metadata Al
   */
  async getMetadataByPlatform(platform: 'twitter' | 'tiktok' | 'instagram'): Promise<VideoMetadata[]> {
    try {
      const allMetadata = await this.getAllVideoMetadata();
      return allMetadata.filter((m) => m.platform === platform);
    } catch (error) {
      console.error('Get metadata by platform error:', error);
      return [];
    }
  }

  /**
   * Garbage Collection - Bellek Temizliği
   * Eski cache'leri ve metadata'ları temizle
   */
  async performGarbageCollection() {
    try {
      console.log('Starting garbage collection...');

      // 1. Eski thumbnail'leri sil (30 günden eski)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const allMetadata = await this.getAllVideoMetadata();
      const recentMetadata = allMetadata.filter((m) => m.downloadedAt > thirtyDaysAgo);

      // Eski dosyaları sil
      const oldMetadata = allMetadata.filter((m) => m.downloadedAt <= thirtyDaysAgo);
      for (const metadata of oldMetadata) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(metadata.fileUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(metadata.fileUri);
          }
          if (metadata.thumbnailUri) {
            const thumbInfo = await FileSystem.getInfoAsync(metadata.thumbnailUri);
            if (thumbInfo.exists) {
              await FileSystem.deleteAsync(metadata.thumbnailUri);
            }
          }
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }

      // 2. Metadata'yı güncelle
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(recentMetadata));

      // 3. Cache boyutunu kontrol et
      const cacheSize = await this.calculateCacheSize();
      if (cacheSize > this.MAX_CACHE_SIZE) {
        await this.clearOldestCache();
      }

      console.log('Garbage collection completed');
    } catch (error) {
      console.error('Garbage collection error:', error);
    }
  }

  /**
   * Cache Boyutunu Hesapla
   */
  private async calculateCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(this.CACHE_DIR + file);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += (fileInfo as any).size || 0;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Calculate cache size error:', error);
      return 0;
    }
  }

  /**
   * En Eski Cache'leri Sil
   */
  private async clearOldestCache() {
    try {
      const files = await FileSystem.readDirectoryAsync(this.CACHE_DIR);
      // En eski 10 dosyayı sil
      for (let i = 0; i < Math.min(10, files.length); i++) {
        await FileSystem.deleteAsync(this.CACHE_DIR + files[i]);
      }
    } catch (error) {
      console.error('Clear oldest cache error:', error);
    }
  }

  /**
   * Tüm Cache'i Temizle
   */
  async clearAllCache() {
    try {
      const files = await FileSystem.readDirectoryAsync(this.CACHE_DIR);
      for (const file of files) {
        await FileSystem.deleteAsync(this.CACHE_DIR + file);
      }
      this.thumbnailCache.clear();
      await AsyncStorage.removeItem(this.METADATA_KEY);
    } catch (error) {
      console.error('Clear all cache error:', error);
    }
  }
}
