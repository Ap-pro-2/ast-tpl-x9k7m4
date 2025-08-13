/**
 * Accessibility Contrast Utilities
 * WCAG AA compliance functions for color contrast
 */

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast meets WCAG AA standards
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Check if contrast meets WCAG AAA standards
export function meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// Darken a color by a percentage
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 - (percent / 100);
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Lighten a color by a percentage
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);
  
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Get accessible text color for a background
export function getAccessibleTextColor(backgroundColor: string, preferDark = true): string {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  // If both meet AA standards, use preference
  if (whiteContrast >= 4.5 && blackContrast >= 4.5) {
    return preferDark ? '#000000' : '#FFFFFF';
  }
  
  // Use whichever has better contrast
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

// Generate accessible color variants for a primary color
export function generateAccessibleVariants(primaryColor: string) {
  const variants = {
    primary: primaryColor,
    primaryLight: lightenColor(primaryColor, 20),
    primaryDark: darkenColor(primaryColor, 20),
    primaryAccessible: primaryColor,
    primaryAccessibleDark: primaryColor,
  };
  
  // Ensure primary color is accessible on light backgrounds
  let testColor = primaryColor;
  let iterations = 0;
  while (!meetsWCAGAA(testColor, '#FFFFFF') && iterations < 10) {
    testColor = darkenColor(testColor, 10);
    iterations++;
  }
  variants.primaryAccessible = testColor;
  
  // Create an even darker version for small text
  variants.primaryAccessibleDark = darkenColor(variants.primaryAccessible, 15);
  
  return variants;
}

// Get contrast-safe color pairs
export function getContrastSafePair(foreground: string, background: string, isLargeText = false) {
  if (meetsWCAGAA(foreground, background, isLargeText)) {
    return { foreground, background };
  }
  
  // Try darkening the foreground
  let safeForeground = foreground;
  let iterations = 0;
  while (!meetsWCAGAA(safeForeground, background, isLargeText) && iterations < 15) {
    safeForeground = darkenColor(safeForeground, 8);
    iterations++;
  }
  
  if (meetsWCAGAA(safeForeground, background, isLargeText)) {
    return { foreground: safeForeground, background };
  }
  
  // If darkening foreground doesn't work, try lightening background
  let safeBackground = background;
  iterations = 0;
  while (!meetsWCAGAA(foreground, safeBackground, isLargeText) && iterations < 15) {
    safeBackground = lightenColor(safeBackground, 5);
    iterations++;
  }
  
  return { 
    foreground: meetsWCAGAA(foreground, safeBackground, isLargeText) ? foreground : safeForeground, 
    background: safeBackground 
  };
}

// Validate theme colors for accessibility
export function validateThemeAccessibility(colors: any) {
  const issues: string[] = [];
  
  // Check primary color on light backgrounds
  if (!meetsWCAGAA(colors.primary, colors.bgPrimary)) {
    issues.push(`Primary color (${colors.primary}) has insufficient contrast on primary background (${colors.bgPrimary})`);
  }
  
  if (!meetsWCAGAA(colors.primary, colors.bgTertiary)) {
    issues.push(`Primary color (${colors.primary}) has insufficient contrast on tertiary background (${colors.bgTertiary})`);
  }
  
  // Check text colors
  if (!meetsWCAGAA(colors.textMuted, colors.bgPrimary)) {
    issues.push(`Muted text (${colors.textMuted}) has insufficient contrast on primary background (${colors.bgPrimary})`);
  }
  
  if (!meetsWCAGAA(colors.textSecondary, colors.bgSecondary)) {
    issues.push(`Secondary text (${colors.textSecondary}) has insufficient contrast on secondary background (${colors.bgSecondary})`);
  }
  
  return {
    isAccessible: issues.length === 0,
    issues,
    totalIssues: issues.length
  };
}