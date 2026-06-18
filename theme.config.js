/** @type {const} */
const themeColors = {
  // Primary accent color (Orange - used for all buttons, toggles, highlights)
  primary: { light: '#FF8C00', dark: '#FF8C00' },
  
  // Theme palettes - 5 different theme options
  // 1. Siyah İnci (Jet Black)
  jetBlack: { light: '#0a0a0a', dark: '#0a0a0a' },
  jetBlackSurface: { light: '#1a1a1a', dark: '#1a1a1a' },
  jetBlackAccent: { light: '#c0c0c0', dark: '#c0c0c0' }, // Silver
  
  // 2. Gece Mavisi (Midnight Blue)
  midnightBlue: { light: '#0a1628', dark: '#0a1628' },
  midnightBlueSurface: { light: '#1a2a42', dark: '#1a2a42' },
  midnightBlueAccent: { light: '#4da6ff', dark: '#4da6ff' }, // Light Blue
  
  // 3. Zümrüt (Emerald)
  emerald: { light: '#0a2818', dark: '#0a2818' },
  emeraldSurface: { light: '#1a4a2e', dark: '#1a4a2e' },
  emeraldAccent: { light: '#4dff99', dark: '#4dff99' }, // Light Green
  
  // 4. Yakut (Ruby)
  ruby: { light: '#2a0a0a', dark: '#2a0a0a' },
  rubySurface: { light: '#4a1a1a', dark: '#4a1a1a' },
  rubyAccent: { light: '#ff6b6b', dark: '#ff6b6b' }, // Light Red
  
  // 5. Nebi Özkan Özel (Special - Gold & Orange gradient)
  nebiSpecial: { light: '#1a1410', dark: '#1a1410' },
  nebiSpecialSurface: { light: '#2a2218', dark: '#2a2218' },
  nebiSpecialAccent: { light: '#ffd700', dark: '#ffd700' }, // Gold
  
  // Standard theme colors
  background: { light: '#ffffff', dark: '#0a0a0a' },
  surface: { light: '#f5f5f5', dark: '#1a1a1a' },
  foreground: { light: '#11181C', dark: '#ECEDEE' },
  muted: { light: '#687076', dark: '#9BA1A6' },
  border: { light: '#E5E7EB', dark: '#334155' },
  success: { light: '#22C55E', dark: '#4ADE80' },
  warning: { light: '#F59E0B', dark: '#FBBF24' },
  error: { light: '#EF4444', dark: '#F87171' },
};

module.exports = { themeColors };
