import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface StealthConfig {
  randomizeUserAgent: boolean;
  rotateCookies: boolean;
  spoofHeaders: boolean;
  useProxy: boolean;
}

export class NetworkStealth {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ];

  private static readonly REFERERS = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.duckduckgo.com/',
    'https://www.ecosia.org/',
  ];

  private static readonly ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9',
    'tr-TR,tr;q=0.9,en;q=0.8',
    'de-DE,de;q=0.9,en;q=0.8',
    'fr-FR,fr;q=0.9,en;q=0.8',
  ];

  private static cookieStore: Map<string, string[]> = new Map();

  static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  static getRandomReferer(): string {
    return this.REFERERS[Math.floor(Math.random() * this.REFERERS.length)];
  }

  static getRandomAcceptLanguage(): string {
    return this.ACCEPT_LANGUAGES[Math.floor(Math.random() * this.ACCEPT_LANGUAGES.length)];
  }

  static generateFingerprint(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');

    return `${timestamp}-${random}`;
  }

  static createStealthClient(config: Partial<StealthConfig> = {}): AxiosInstance {
    const {
      randomizeUserAgent = true,
      rotateCookies = true,
      spoofHeaders = true,
      useProxy = false,
    } = config;

    const client = axios.create({
      timeout: 30000,
      maxRedirects: 5,
    });

    // Request interceptor
    client.interceptors.request.use((axiosConfig) => {
      const headers = axiosConfig.headers || {};

      // Randomize User-Agent
      if (randomizeUserAgent) {
        headers['User-Agent'] = this.getRandomUserAgent();
      }

      // Spoof headers
      if (spoofHeaders) {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
        headers['Accept-Language'] = this.getRandomAcceptLanguage();
        headers['Accept-Encoding'] = 'gzip, deflate, br';
        headers['DNT'] = '1';
        headers['Connection'] = 'keep-alive';
        headers['Upgrade-Insecure-Requests'] = '1';
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Sec-Fetch-Site'] = 'none';
        headers['Cache-Control'] = 'max-age=0';
        headers['Referer'] = this.getRandomReferer();
      }

      // Add fingerprint
      headers['X-Fingerprint'] = this.generateFingerprint();

      axiosConfig.headers = headers;

      return axiosConfig;
    });

    // Response interceptor for cookie rotation
    client.interceptors.response.use(
      (response) => {
        if (rotateCookies) {
          const setCookie = response.headers['set-cookie'];

          if (setCookie) {
            const url = response.config.url || 'default';
            this.storeCookies(url, Array.isArray(setCookie) ? setCookie : [setCookie]);
          }
        }

        return response;
      },
      (error) => {
        console.error('[NETWORK_STEALTH] Request error:', error.message);
        return Promise.reject(error);
      }
    );

    return client;
  }

  static storeCookies(domain: string, cookies: string[]): void {
    if (!this.cookieStore.has(domain)) {
      this.cookieStore.set(domain, []);
    }

    const stored = this.cookieStore.get(domain) || [];
    stored.push(...cookies);

    // Keep only last 10 cookies per domain
    if (stored.length > 10) {
      stored.splice(0, stored.length - 10);
    }

    this.cookieStore.set(domain, stored);

    console.log(`[NETWORK_STEALTH] Stored ${cookies.length} cookies for ${domain}`);
  }

  static getCookies(domain: string): string[] {
    return this.cookieStore.get(domain) || [];
  }

  static clearCookies(): void {
    this.cookieStore.clear();
    console.log('[NETWORK_STEALTH] Cleared all cookies');
  }

  static rotateUserAgent(): string {
    const newAgent = this.getRandomUserAgent();
    console.log(`[NETWORK_STEALTH] Rotated User-Agent`);

    return newAgent;
  }

  static async testConnectivity(): Promise<boolean> {
    try {
      const client = this.createStealthClient();
      const response = await client.get('https://www.google.com', {
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      console.error('[NETWORK_STEALTH] Connectivity test failed:', error);
      return false;
    }
  }

  static async validateUrl(url: string): Promise<boolean> {
    try {
      const client = this.createStealthClient();
      const response = await client.head(url, {
        timeout: 10000,
      });

      return response.status === 200 || response.status === 301 || response.status === 302;
    } catch (error) {
      console.error('[NETWORK_STEALTH] URL validation failed:', error);
      return false;
    }
  }

  static getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const usage = process.memoryUsage();

    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }

  static logMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    console.log(
      `[NETWORK_STEALTH] Memory Usage - Heap: ${usage.heapUsed}MB/${usage.heapTotal}MB, External: ${usage.external}MB`
    );
  }
}
