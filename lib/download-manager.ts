import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Platform = 'twitter' | 'tiktok' | 'instagram';
export type Quality = '360p' | '480p' | '720p' | '1080p';

export interface DownloadedVideo {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  filename: string;
  fileSize: number;
  downloadedAt: number;
  quality: Quality;
  thumbnailUri?: string;
}

export interface DownloadProgress {
  progress: number;
  totalSize: number;
  downloadedSize: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}akrepindirici_downloads/`;
const DOWNLOADS_HISTORY_KEY = 'akrepindirici_downloads_history';
const CLIPBOARD_HISTORY_KEY = 'akrepindirici_clipboard_history';

export class DownloadManager {
  static async initializeDownloadDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize download directory:', error);
    }
  }

  static async addDownloadHistory(video: DownloadedVideo): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      history.unshift(video);
      // Keep only last 100 downloads
      const limited = history.slice(0, 100);
      await AsyncStorage.setItem(DOWNLOADS_HISTORY_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save download history:', error);
    }
  }

  static async getDownloadHistory(platform?: Platform): Promise<DownloadedVideo[]> {
    try {
      const history = await AsyncStorage.getItem(DOWNLOADS_HISTORY_KEY);
      const videos: DownloadedVideo[] = history ? JSON.parse(history) : [];
      
      if (platform) {
        return videos.filter((v) => v.platform === platform);
      }
      return videos;
    } catch (error) {
      console.error('Failed to get download history:', error);
      return [];
    }
  }

  static async deleteDownload(videoId: string): Promise<void> {
    try {
      const history = await this.getDownloadHistory();
      const video = history.find((v) => v.id === videoId);
      
      if (video) {
        const filePath = `${DOWNLOADS_DIR}${video.filename}`;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
        
        const updated = history.filter((v) => v.id !== videoId);
        await AsyncStorage.setItem(DOWNLOADS_HISTORY_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to delete download:', error);
    }
  }

  static async getDownloadedVideoPath(videoId: string): Promise<string | null> {
    try {
      const history = await this.getDownloadHistory();
      const video = history.find((v) => v.id === videoId);
      
      if (video) {
        const filePath = `${DOWNLOADS_DIR}${video.filename}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        return fileInfo.exists ? filePath : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get downloaded video path:', error);
      return null;
    }
  }

  static async addClipboardHistory(url: string): Promise<void> {
    try {
      const history = await AsyncStorage.getItem(CLIPBOARD_HISTORY_KEY);
      const urls: string[] = history ? JSON.parse(history) : [];
      
      if (!urls.includes(url)) {
        urls.unshift(url);
        const limited = urls.slice(0, 50);
        await AsyncStorage.setItem(CLIPBOARD_HISTORY_KEY, JSON.stringify(limited));
      }
    } catch (error) {
      console.error('Failed to save clipboard history:', error);
    }
  }

  static async getClipboardHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem(CLIPBOARD_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get clipboard history:', error);
      return [];
    }
  }

  static validateUrl(url: string, platform: Platform): boolean {
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
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  static generateVideoId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateFilename(platform: Platform, quality: Quality): string {
    const timestamp = Date.now();
    return `${platform}_${quality}_${timestamp}.mp4`;
  }

  static getQualityLabel(quality: Quality): string {
    const labels: Record<Quality, string> = {
      '360p': '360p (Düşük)',
      '480p': '480p (Orta)',
      '720p': '720p (Yüksek)',
      '1080p': '1080p (Çok Yüksek)',
    };
    return labels[quality];
  }
}
