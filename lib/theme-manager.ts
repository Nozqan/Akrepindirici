import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'jetBlack' | 'midnightBlue' | 'emerald' | 'ruby' | 'nebiSpecial';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

const THEME_STORAGE_KEY = 'akrepindirici_theme';

export const themes: Record<ThemeName, ThemeColors> = {
  jetBlack: {
    primary: '#FF8C00',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    foreground: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#334155',
    accent: '#c0c0c0',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  midnightBlue: {
    primary: '#FF8C00',
    background: '#0a1628',
    surface: '#1a2a42',
    foreground: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#334155',
    accent: '#4da6ff',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  emerald: {
    primary: '#FF8C00',
    background: '#0a2818',
    surface: '#1a4a2e',
    foreground: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#334155',
    accent: '#4dff99',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  ruby: {
    primary: '#FF8C00',
    background: '#2a0a0a',
    surface: '#4a1a1a',
    foreground: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#334155',
    accent: '#ff6b6b',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  nebiSpecial: {
    primary: '#FF8C00',
    background: '#1a1410',
    surface: '#2a2218',
    foreground: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#334155',
    accent: '#ffd700',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
};

export class ThemeManager {
  static async getCurrentTheme(): Promise<ThemeName> {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      return (stored as ThemeName) || 'jetBlack';
    } catch {
      return 'jetBlack';
    }
  }

  static async setTheme(theme: ThemeName): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  static getThemeColors(theme: ThemeName): ThemeColors {
    return themes[theme];
  }

  static getAllThemes(): ThemeName[] {
    return Object.keys(themes) as ThemeName[];
  }

  static getThemeLabel(theme: ThemeName): string {
    const labels: Record<ThemeName, string> = {
      jetBlack: 'Siyah İnci',
      midnightBlue: 'Gece Mavisi',
      emerald: 'Zümrüt',
      ruby: 'Yakut',
      nebiSpecial: 'Nebi Özel',
    };
    return labels[theme];
  }
}
