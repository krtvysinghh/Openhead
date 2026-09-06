export interface OfficeThemePalette {
  id: string;
  name: string;
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSubtle: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  selection: string;
  error: string;
  success: string;
}

export const OPENHEAD_THEMES: Record<string, OfficeThemePalette> = {
  dark: {
    id: 'dark',
    name: 'Openhead Dark (Default)',
    isDark: true,
    background: '#090d16',
    surface: '#0f172a',
    surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    selection: 'rgba(99, 102, 241, 0.3)',
    error: '#ef4444',
    success: '#10b981',
  },
  light: {
    id: 'light',
    name: 'Executive Clean Light',
    isDark: false,
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSubtle: 'rgba(0, 0, 0, 0.03)',
    border: 'rgba(0, 0, 0, 0.12)',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    selection: 'rgba(37, 99, 235, 0.15)',
    error: '#dc2626',
    success: '#059669',
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast (Accessible)',
    isDark: true,
    background: '#000000',
    surface: '#0a0a0a',
    surfaceSubtle: '#1a1a1a',
    border: '#ffffff',
    textPrimary: '#ffffff',
    textSecondary: '#ffff00',
    accent: '#00ffff',
    accentHover: '#38bdf8',
    selection: '#ffffff',
    error: '#ff0000',
    success: '#00ff00',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Modern',
    isDark: true,
    background: '#022c22',
    surface: '#064e3b',
    surfaceSubtle: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(52, 211, 153, 0.25)',
    textPrimary: '#ecfdf5',
    textSecondary: '#6ee7b7',
    accent: '#10b981',
    accentHover: '#059669',
    selection: 'rgba(16, 185, 129, 0.3)',
    error: '#f87171',
    success: '#34d399',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Minimal',
    isDark: true,
    background: '#18181b',
    surface: '#27272a',
    surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(249, 115, 22, 0.25)',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    accent: '#f97316',
    accentHover: '#ea580c',
    selection: 'rgba(249, 115, 22, 0.3)',
    error: '#f43f5e',
    success: '#10b981',
  },
};

export class ThemeEngine {
  public static getTheme(themeId: string): OfficeThemePalette {
    return OPENHEAD_THEMES[themeId] || OPENHEAD_THEMES.dark;
  }

  public static calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
    const lum1 = this.getLuminance(foregroundHex);
    const lum2 = this.getLuminance(backgroundHex);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private static getLuminance(hex: string): number {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const [aR, aG, aB] = [r, g, b].map((val) => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
    return aR * 0.2126 + aG * 0.7152 + aB * 0.0722;
  }
}
