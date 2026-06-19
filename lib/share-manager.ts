import { Alert } from 'react-native';

  videoUrl: string;
  fileName: string;
  platform: 'twitter' | 'tiktok' | 'instagram' | 'youtube';
  title?: string;
}

  id: 'whatsapp' | 'telegram' | 'email' | 'sms' | 'facebook' | 'copy';
  name: string;
  icon: string;
}

  static readonly SHARE_TARGETS: ShareTarget[] = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'facebook', name: 'Facebook', icon: '👍' },
    { id: 'copy', name: 'Linki Kopyala', icon: '📋' },
  ];

  static async shareVideo(options: ShareOptions): Promise<boolean> {
    try {
      const { videoUrl, fileName, platform, title } = options;

      const shareMessage = `Akrepindirici ile indirilen ${platform} videosu: ${title || fileName}`;

      // Use native sharing
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(videoUrl, {
          mimeType: 'video/mp4',
          dialogTitle: 'Videoyu Paylaş',
          UTI: 'com.apple.quicktime-movie',
        });

        return true;
      } else {
        // Fallback: Copy to clipboard
        await this.copyLinkToClipboard(videoUrl);
        return true;
      }
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  static async shareToWhatsApp(options: ShareOptions): Promise<boolean> {
    try {
      const { videoUrl, fileName, platform } = options;

      const message = `Akrepindirici ile indirilen ${platform} videosu: ${videoUrl}`;

      // WhatsApp URL scheme
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

      // Try to open WhatsApp
      const canOpen = await Sharing.isAvailableAsync();
      if (canOpen) {
        // Fallback to system share
        await Sharing.shareAsync(videoUrl, {
          mimeType: 'video/mp4',
        });
      }

      return true;
    } catch (error) {
      console.error('WhatsApp share error:', error);
      return false;
    }
  }

  static async shareToTelegram(options: ShareOptions): Promise<boolean> {
    try {
      const { videoUrl, fileName, platform } = options;

      const message = `Akrepindirici ile indirilen ${platform} videosu: ${videoUrl}`;

      // Telegram URL scheme
      const telegramUrl = `tg://msg?text=${encodeURIComponent(message)}`;

      // Try to open Telegram
      const canOpen = await Sharing.isAvailableAsync();
      if (canOpen) {
        await Sharing.shareAsync(videoUrl, {
          mimeType: 'video/mp4',
        });
      }

      return true;
    } catch (error) {
      console.error('Telegram share error:', error);
      return false;
    }
  }

  static async shareViaEmail(options: ShareOptions): Promise<boolean> {
    try {
      const { videoUrl, fileName, platform, title } = options;

      const subject = `Akrepindirici - ${platform} Videosu`;
      const body = `
Merhaba,

Akrepindirici uygulaması ile indirilen ${platform} videosu:

Dosya: ${title || fileName}
Bağlantı: ${videoUrl}

Akrepindirici - Ücretsiz ve Reklamsız Video İndirme
      `;

      // Email URL scheme
      const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Try to open email
      const canOpen = await Sharing.isAvailableAsync();
      if (canOpen) {
        await Sharing.shareAsync(videoUrl, {
          mimeType: 'video/mp4',
        });
      }

      return true;
    } catch (error) {
      console.error('Email share error:', error);
      return false;
    }
  }

  static async copyLinkToClipboard(url: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(url);
      return true;
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  }

  static async generateShareableLink(videoUrl: string, platform: string): Promise<string> {
    // Generate a shareable link with metadata
    const params = new URLSearchParams({
      url: videoUrl,
      platform,
      app: 'akrepindirici',
      timestamp: Date.now().toString(),
    });

    return `https://akrepindirici.app/share?${params.toString()}`;
  }

  static async shareWithQRCode(videoUrl: string): Promise<boolean> {
    try {
      // Generate QR code and share
      const message = `Akrepindirici Video: ${videoUrl}`;

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(videoUrl, {
          dialogTitle: 'QR Kod ile Paylaş',
        });
      }

      return true;
    } catch (error) {
      console.error('QR share error:', error);
      return false;
    }
  }

  static getShareMessage(platform: string, fileName: string): string {
    const messages: Record<string, string> = {
      twitter: `🐦 Twitter'dan indirilen video: ${fileName}`,
      tiktok: `🎵 TikTok'tan indirilen video: ${fileName}`,
      instagram: `📸 Instagram'dan indirilen video: ${fileName}`,
      youtube: `▶️ YouTube'dan indirilen video: ${fileName}`,
    };

    return messages[platform] || `Akrepindirici ile indirilen video: ${fileName}`;
  }
}
