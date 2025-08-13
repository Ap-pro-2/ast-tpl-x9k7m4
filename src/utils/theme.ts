/**
 * Theme Utilities
 * Helper functions for theme management
 */

import { defaultTheme, themePresets, generateThemeCSS, type ThemeConfig } from '../config/theme';
import { userTheme } from '../config/user-theme';

// Get current theme (uses user configuration)
export function getCurrentTheme(): ThemeConfig {
  // Use the user's theme configuration
  return userTheme || defaultTheme;
}

// Get theme preset by name
export function getThemePreset(presetName: keyof typeof themePresets): ThemeConfig {
  return themePresets[presetName] || defaultTheme;
}

// Generate theme CSS for injection
export function getThemeCSS(themeName?: keyof typeof themePresets): string {
  const theme = themeName ? getThemePreset(themeName) : getCurrentTheme();
  return generateThemeCSS(theme);
}

// Tailwind class utilities that use CSS variables
export const themeClasses = {
  // Colors
  primary: 'text-[var(--color-primary)]',
  primaryBg: 'bg-[var(--color-primary)]',
  primaryBorder: 'border-[var(--color-primary)]',
  
  secondary: 'text-[var(--color-secondary)]',
  secondaryBg: 'bg-[var(--color-secondary)]',
  
  accent: 'text-[var(--color-accent)]',
  accentBg: 'bg-[var(--color-accent)]',
  
  // Text Colors
  textPrimary: 'text-[var(--text-primary)]',
  textSecondary: 'text-[var(--text-secondary)]',
  textMuted: 'text-[var(--text-muted)]',
  textAccent: 'text-[var(--text-accent)]',
  
  // Backgrounds
  bgPrimary: 'bg-[var(--bg-primary)]',
  bgSecondary: 'bg-[var(--bg-secondary)]',
  bgTertiary: 'bg-[var(--bg-tertiary)]',
  
  // Surfaces
  surfaceCard: 'bg-[var(--surface-card)]',
  surfaceOverlay: 'bg-[var(--surface-overlay)]',
  
  // Borders
  borderDefault: 'border-[var(--border-default)]',
  borderLight: 'border-[var(--border-light)]',
  borderAccent: 'border-[var(--border-accent)]',
  
  // Border Radius
  radiusSm: 'rounded-[var(--radius-sm)]',
  radiusMd: 'rounded-[var(--radius-md)]',
  radiusLg: 'rounded-[var(--radius-lg)]',
  radiusXl: 'rounded-[var(--radius-xl)]',
  radiusFull: 'rounded-[var(--radius-full)]',
};

// Helper function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Theme-aware component class generators
export const componentClasses = {
  // Button variants
  button: {
    base: cn(
      'inline-flex items-center justify-center font-medium transition-all duration-[var(--animation-duration)]',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      themeClasses.radiusLg
    ),
    primary: cn(
      themeClasses.primaryBg,
      'text-white hover:opacity-90',
      'focus:ring-[var(--color-primary)]'
    ),
    secondary: cn(
      themeClasses.surfaceCard,
      themeClasses.borderDefault,
      themeClasses.textSecondary,
      'border hover:bg-[var(--bg-secondary)]',
      'focus:ring-[var(--color-primary)]'
    ),
    outline: cn(
      'border-2',
      themeClasses.primaryBorder,
      themeClasses.primary,
      'hover:bg-[var(--color-primary)] hover:text-white',
      'focus:ring-[var(--color-primary)]'
    ),
  },
  
  // Card variants
  card: {
    base: cn(
      themeClasses.surfaceCard,
      themeClasses.borderDefault,
      'border overflow-hidden transition-shadow duration-[var(--animation-duration)]',
      themeClasses.radiusLg
    ),
    hover: 'hover:shadow-[var(--shadow-md)]',
    interactive: 'hover:shadow-[var(--shadow-lg)] cursor-pointer',
  },
  
  // Text variants
  text: {
    heading: cn(themeClasses.textPrimary, 'font-bold leading-tight'),
    body: cn(themeClasses.textSecondary, 'leading-relaxed'),
    muted: cn(themeClasses.textMuted, 'text-sm'),
    accent: cn(themeClasses.textAccent, 'font-medium'),
  },
  
  // Input variants
  input: {
    base: cn(
      themeClasses.surfaceCard,
      themeClasses.borderDefault,
      themeClasses.textPrimary,
      'border px-3 py-2 transition-colors duration-[var(--animation-duration)]',
      'focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none',
      themeClasses.radiusLg
    ),
  },
  
  // Badge variants
  badge: {
    primary: cn(
      'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
      'px-2 py-1 text-xs font-medium',
      themeClasses.radiusFull
    ),
    secondary: cn(
      themeClasses.bgTertiary,
      themeClasses.textSecondary,
      'px-2 py-1 text-xs font-medium',
      themeClasses.radiusFull
    ),
  },
};