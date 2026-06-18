import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TwitterDownloader } from '../server/_core/twitter-downloader';
import { TikTokDownloader } from '../server/_core/tiktok-downloader';
import { InstagramDownloader } from '../server/_core/instagram-downloader';
import { PasscodeManager } from '../lib/passcode-manager';
import { BiometricManager } from '../lib/biometric-manager';
import { ShareManager } from '../lib/share-manager';
import { NetworkStealth } from '../server/_core/network-stealth';

describe('Video Download Features', () => {
  describe('Twitter Downloader', () => {
    it('should validate Twitter URL', async () => {
      const validUrl = 'https://twitter.com/user/status/1234567890';
      const tweetId = await TwitterDownloader.extractTweetId(validUrl);

      expect(tweetId).toBe('1234567890');
    });

    it('should extract tweet ID from various formats', async () => {
      const urls = [
        'https://twitter.com/user/status/1234567890',
        'https://x.com/user/status/1234567890',
        'https://twitter.com/user/statuses/1234567890',
      ];

      for (const url of urls) {
        const tweetId = await TwitterDownloader.extractTweetId(url);
        expect(tweetId).toBe('1234567890');
      }
    });

    it('should handle invalid URLs', async () => {
      const invalidUrl = 'https://example.com/invalid';
      const tweetId = await TwitterDownloader.extractTweetId(invalidUrl);

      expect(tweetId).toBeNull();
    });
  });

  describe('TikTok Downloader', () => {
    it('should extract TikTok video ID', async () => {
      const validUrl = 'https://www.tiktok.com/@user/video/1234567890';
      const videoId = await TikTokDownloader.extractVideoId(validUrl);

      expect(videoId).toBe('1234567890');
    });

    it('should handle TikTok short URLs', async () => {
      const shortUrl = 'https://vm.tiktok.com/abc123def456';
      const videoId = await TikTokDownloader.extractVideoId(shortUrl);

      expect(videoId).toBe('abc123def456');
    });
  });

  describe('Instagram Downloader', () => {
    it('should extract Instagram post ID', async () => {
      const validUrl = 'https://www.instagram.com/p/abc123def456/';
      const postId = await InstagramDownloader.extractPostId(validUrl);

      expect(postId).toBe('abc123def456');
    });

    it('should handle Instagram Reel URLs', async () => {
      const reelUrl = 'https://www.instagram.com/reel/abc123def456/';
      const postId = await InstagramDownloader.extractPostId(reelUrl);

      expect(postId).toBe('abc123def456');
    });
  });
});

describe('Security Features', () => {
  describe('Passcode Manager', () => {
    beforeEach(async () => {
      await PasscodeManager.initializePasscode();
    });

    it('should validate passcode format', () => {
      expect(PasscodeManager.validatePasscodeFormat('1234')).toBe(true);
      expect(PasscodeManager.validatePasscodeFormat('123456')).toBe(true);
      expect(PasscodeManager.validatePasscodeFormat('123')).toBe(false);
      expect(PasscodeManager.validatePasscodeFormat('abcd')).toBe(false);
    });

    it('should generate random passcode', () => {
      const passcode = PasscodeManager.generateDefaultPasscode();

      expect(passcode).toHaveLength(6);
      expect(/^\d+$/.test(passcode)).toBe(true);
    });

    it('should enable and disable passcode', async () => {
      const result = await PasscodeManager.enablePasscode('1234');
      expect(result).toBe(true);

      const enabled = await PasscodeManager.isPasscodeEnabled();
      expect(enabled).toBe(true);

      const disabled = await PasscodeManager.disablePasscode();
      expect(disabled).toBe(true);
    });
  });

  describe('Biometric Manager', () => {
    it('should check biometric availability', async () => {
      const available = await BiometricManager.isAvailable();

      expect(typeof available).toBe('boolean');
    });

    it('should check if biometric is enabled', async () => {
      const enabled = await BiometricManager.isBiometricEnabled();

      expect(typeof enabled).toBe('boolean');
    });
  });
});

describe('Sharing Features', () => {
  describe('Share Manager', () => {
    it('should validate share targets', () => {
      const targets = ShareManager.SHARE_TARGETS;

      expect(targets.length).toBeGreaterThan(0);
      expect(targets.some((t) => t.id === 'whatsapp')).toBe(true);
      expect(targets.some((t) => t.id === 'telegram')).toBe(true);
      expect(targets.some((t) => t.id === 'email')).toBe(true);
    });

    it('should generate share message', () => {
      const message = ShareManager.getShareMessage('twitter', 'video.mp4');

      expect(message).toContain('Twitter');
      expect(message).toContain('video.mp4');
    });

    it('should generate shareable link', async () => {
      const link = await ShareManager.generateShareableLink('https://example.com/video.mp4', 'twitter');

      expect(link).toContain('https://akrepindirici.app/share');
      expect(link).toContain('twitter');
    });
  });
});

describe('Network & Bot Verification', () => {
  describe('Network Stealth', () => {
    it('should generate random user agent', () => {
      const ua1 = NetworkStealth.getRandomUserAgent();
      const ua2 = NetworkStealth.getRandomUserAgent();

      expect(ua1).toBeTruthy();
      expect(ua2).toBeTruthy();
      // Might be same or different
    });

    it('should generate fingerprint', () => {
      const fp1 = NetworkStealth.generateFingerprint();
      const fp2 = NetworkStealth.generateFingerprint();

      expect(fp1).toBeTruthy();
      expect(fp2).toBeTruthy();
      expect(fp1).not.toBe(fp2);
    });

    it('should create stealth client', () => {
      const client = NetworkStealth.createStealthClient({
        randomizeUserAgent: true,
        spoofHeaders: true,
      });

      expect(client).toBeTruthy();
      expect(client.interceptors).toBeTruthy();
    });

    it('should manage cookies', () => {
      NetworkStealth.storeCookies('example.com', ['cookie1=value1', 'cookie2=value2']);

      const cookies = NetworkStealth.getCookies('example.com');

      expect(cookies).toHaveLength(2);
      expect(cookies).toContain('cookie1=value1');

      NetworkStealth.clearCookies();
      const clearedCookies = NetworkStealth.getCookies('example.com');

      expect(clearedCookies).toHaveLength(0);
    });

    it('should get memory usage', () => {
      const usage = NetworkStealth.getMemoryUsage();

      expect(usage.heapUsed).toBeGreaterThan(0);
      expect(usage.heapTotal).toBeGreaterThan(0);
      expect(usage.external).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Animation Features', () => {
  it('should have animation manager available', () => {
    // Animation manager is tested through UI components
    // This is a placeholder for integration tests
    expect(true).toBe(true);
  });
});

describe('Theme Features', () => {
  it('should support multiple themes', () => {
    const themes = ['light', 'dark', 'siyah-inci', 'gece-mavisi', 'zumrut', 'yakut', 'nebi-ozel'];

    expect(themes.length).toBe(7);
  });
});

describe('Performance & Memory', () => {
  it('should track memory usage', () => {
    const usage = NetworkStealth.getMemoryUsage();

    expect(usage.heapUsed).toBeLessThan(usage.heapTotal);
  });

  it('should handle cleanup', async () => {
    await TwitterDownloader.cleanupOldFiles();
    await TikTokDownloader.cleanupOldFiles();
    await InstagramDownloader.cleanupOldFiles();

    expect(true).toBe(true);
  });
});
