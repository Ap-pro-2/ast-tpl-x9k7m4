/**
 * Color Utility Functions for Accessibility
 * Calculates appropriate text colors based on background colors for WCAG compliance
 */

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(luminance1: number, luminance2: number): number {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if white or black text provides better contrast
 * Returns 'white' or 'black' based on WCAG AA standards (4.5:1 contrast ratio)
 */
export function getAccessibleTextColor(backgroundColor: string): 'white' | 'black' {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'white'; // fallback to white for invalid colors
  
  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // Calculate actual contrast ratios
  const contrastWithWhite = getContrastRatio(1.0, bgLuminance); // white luminance is 1.0
  const contrastWithBlack = getContrastRatio(0.0, bgLuminance); // black luminance is 0.0
  
  // WCAG AA requires 4.5:1 contrast ratio for normal text
  // Choose the text color that provides better contrast
  if (contrastWithWhite >= 4.5 && contrastWithWhite >= contrastWithBlack) {
    return 'white';
  } else if (contrastWithBlack >= 4.5) {
    return 'black';
  } else {
    // If neither provides sufficient contrast, choose the better one
    return contrastWithWhite > contrastWithBlack ? 'white' : 'black';
  }
}

/**
 * Darken a color by reducing its lightness
 */
function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Convert to HSL, reduce lightness, convert back
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  
  const l = sum / 2;
  
  if (diff === 0) {
    // Grayscale - just darken
    const newL = Math.max(0, l - amount);
    const newRgb = Math.round(newL * 255);
    return `#${newRgb.toString(16).padStart(2, '0').repeat(3)}`;
  }
  
  // For colored backgrounds, darken by reducing each component
  const newR = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const newG = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const newB = Math.max(0, Math.round(rgb.b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Get CSS styles for accessible badge based on background color
 */
export function getAccessibleBadgeStyles(backgroundColor: string): { 
  backgroundColor: string; 
  color: string; 
} {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return { backgroundColor, color: 'white' };
  
  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWithWhite = getContrastRatio(1.0, bgLuminance);
  const contrastWithBlack = getContrastRatio(0.0, bgLuminance);
  
  // If background color doesn't provide sufficient contrast with any text color,
  // darken it until it does
  let adjustedColor = backgroundColor;
  let adjustedLuminance = bgLuminance;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts && 
         Math.max(getContrastRatio(1.0, adjustedLuminance), getContrastRatio(0.0, adjustedLuminance)) < 4.5) {
    adjustedColor = darkenColor(adjustedColor, 0.15);
    const adjustedRgb = hexToRgb(adjustedColor);
    if (adjustedRgb) {
      adjustedLuminance = getLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
    }
    attempts++;
  }
  
  const textColor = getAccessibleTextColor(adjustedColor);
  return {
    backgroundColor: adjustedColor,
    color: textColor
  };
}

/**
 * Astro-compatible function to get inline styles for badges
 */
export function getBadgeStyleString(backgroundColor: string): string {
  const styles = getAccessibleBadgeStyles(backgroundColor);
  return `background: ${styles.backgroundColor}; color: ${styles.color}`;
}