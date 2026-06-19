
  enabled: boolean;
  passcode: string; // hashed
  attempts: number;
  maxAttempts: number;
  lockoutTime: number; // ms
  lastAttempt: number;
}

  private static readonly PASSCODE_KEY = 'app_passcode_config';
  private static readonly DEFAULT_PASSCODE = '0000';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

  static async initializePasscode(): Promise<void> {
    try {
      const config = await this.getPasscodeConfig();

      if (!config) {
        // Initialize with default passcode
        const hashedPasscode = await this.hashPasscode(this.DEFAULT_PASSCODE);

        await SecureStore.setItemAsync(
          this.PASSCODE_KEY,
          JSON.stringify({
            enabled: false,
            passcode: hashedPasscode,
            attempts: 0,
            maxAttempts: this.MAX_ATTEMPTS,
            lockoutTime: this.LOCKOUT_TIME,
            lastAttempt: 0,
          })
        );

        console.log('[PASSCODE] Initialized with default passcode');
      }
    } catch (error) {
      console.error('[PASSCODE] Initialization error:', error);
    }
  }

  static async getPasscodeConfig(): Promise<PasscodeConfig | null> {
    try {
      const config = await SecureStore.getItemAsync(this.PASSCODE_KEY);

      if (!config) return null;

      return JSON.parse(config) as PasscodeConfig;
    } catch (error) {
      console.error('[PASSCODE] Config retrieval error:', error);
      return null;
    }
  }

  static async setPasscode(newPasscode: string): Promise<boolean> {
    try {
      if (newPasscode.length < 4 || newPasscode.length > 6) {
        console.error('[PASSCODE] Invalid passcode length');
        return false;
      }

      const config = await this.getPasscodeConfig();

      if (!config) {
        await this.initializePasscode();
        return this.setPasscode(newPasscode);
      }

      const hashedPasscode = await this.hashPasscode(newPasscode);

      config.passcode = hashedPasscode;
      config.attempts = 0;
      config.lastAttempt = 0;

      await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

      console.log('[PASSCODE] Passcode updated successfully');

      return true;
    } catch (error) {
      console.error('[PASSCODE] Set passcode error:', error);
      return false;
    }
  }

  static async enablePasscode(passcode: string): Promise<boolean> {
    try {
      const config = await this.getPasscodeConfig();

      if (!config) {
        await this.initializePasscode();
        return this.enablePasscode(passcode);
      }

      const hashedPasscode = await this.hashPasscode(passcode);

      config.passcode = hashedPasscode;
      config.enabled = true;
      config.attempts = 0;

      await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

      console.log('[PASSCODE] Passcode enabled');

      return true;
    } catch (error) {
      console.error('[PASSCODE] Enable passcode error:', error);
      return false;
    }
  }

  static async disablePasscode(): Promise<boolean> {
    try {
      const config = await this.getPasscodeConfig();

      if (!config) return false;

      config.enabled = false;
      config.attempts = 0;

      await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

      console.log('[PASSCODE] Passcode disabled');

      return true;
    } catch (error) {
      console.error('[PASSCODE] Disable passcode error:', error);
      return false;
    }
  }

  static async verifyPasscode(inputPasscode: string): Promise<{ success: boolean; message: string }> {
    try {
      const config = await this.getPasscodeConfig();

      if (!config) {
        return { success: false, message: 'Passcode config not found' };
      }

      if (!config.enabled) {
        return { success: true, message: 'Passcode disabled' };
      }

      // Check if locked out
      const now = Date.now();
      if (config.attempts >= config.maxAttempts) {
        const timeSinceLast = now - config.lastAttempt;

        if (timeSinceLast < config.lockoutTime) {
          const remainingTime = Math.ceil((config.lockoutTime - timeSinceLast) / 1000);
          return {
            success: false,
            message: `Çok fazla deneme. ${remainingTime} saniye sonra tekrar deneyin.`,
          };
        } else {
          // Reset attempts
          config.attempts = 0;
        }
      }

      // Verify passcode
      const hashedInput = await this.hashPasscode(inputPasscode);

      if (hashedInput === config.passcode) {
        config.attempts = 0;
        config.lastAttempt = 0;

        await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

        console.log('[PASSCODE] Passcode verified successfully');

        return { success: true, message: 'Passcode verified' };
      } else {
        config.attempts += 1;
        config.lastAttempt = now;

        await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

        const remaining = config.maxAttempts - config.attempts;

        console.log(`[PASSCODE] Invalid passcode. Attempts remaining: ${remaining}`);

        return {
          success: false,
          message: `Yanlış passcode. ${remaining} deneme kaldı.`,
        };
      }
    } catch (error) {
      console.error('[PASSCODE] Verification error:', error);
      return { success: false, message: 'Doğrulama hatası' };
    }
  }

  static async isPasscodeEnabled(): Promise<boolean> {
    try {
      const config = await this.getPasscodeConfig();

      return config?.enabled || false;
    } catch (error) {
      console.error('[PASSCODE] Check enabled error:', error);
      return false;
    }
  }

  static async resetPasscode(): Promise<boolean> {
    try {
      const config = await this.getPasscodeConfig();

      if (!config) return false;

      config.attempts = 0;
      config.lastAttempt = 0;

      await SecureStore.setItemAsync(this.PASSCODE_KEY, JSON.stringify(config));

      console.log('[PASSCODE] Reset successfully');

      return true;
    } catch (error) {
      console.error('[PASSCODE] Reset error:', error);
      return false;
    }
  }

  private static async hashPasscode(passcode: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passcode
      );

      return digest;
    } catch (error) {
      console.error('[PASSCODE] Hash error:', error);
      throw error;
    }
  }

  static validatePasscodeFormat(passcode: string): boolean {
    // 4-6 digits
    return /^\d{4,6}$/.test(passcode);
  }

  static generateDefaultPasscode(): string {
    return Math.random().toString().slice(2, 8);
  }
}
