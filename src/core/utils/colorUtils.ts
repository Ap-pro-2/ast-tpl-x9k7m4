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
  const whiteLuminance = 1; // White has luminance of 1
  const blackLuminance = 0; // Black has luminance of 0
  
  const whiteContrast = getContrastRatio(bgLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(bgLuminance, blackLuminance);
  
  // Return the color that provides better contrast
  // Prefer white if contrasts are equal (for design consistency)
  return blackContrast > whiteContrast ? 'black' : 'white';
}

/**
 * Get CSS styles for accessible badge based on background color
 */
export function getAccessibleBadgeStyles(backgroundColor: string): { 
  backgroundColor: string; 
  color: string; 
} {
  const textColor = getAccessibleTextColor(backgroundColor);
  return {
    backgroundColor,
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