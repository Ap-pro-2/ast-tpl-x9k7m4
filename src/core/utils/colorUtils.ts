


export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}


export function getContrastRatio(luminance1: number, luminance2: number): number {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}


export function getAccessibleTextColor(backgroundColor: string): 'white' | 'black' {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'white'; 
  
  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  
  const contrastWithWhite = getContrastRatio(1.0, bgLuminance); 
  const contrastWithBlack = getContrastRatio(0.0, bgLuminance); 
  
  
  
  if (contrastWithWhite >= 4.5 && contrastWithWhite >= contrastWithBlack) {
    return 'white';
  } else if (contrastWithBlack >= 4.5) {
    return 'black';
  } else {
    
    return contrastWithWhite > contrastWithBlack ? 'white' : 'black';
  }
}


function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  
  const l = sum / 2;
  
  if (diff === 0) {
    
    const newL = Math.max(0, l - amount);
    const newRgb = Math.round(newL * 255);
    return `#${newRgb.toString(16).padStart(2, '0').repeat(3)}`;
  }
  
  
  const newR = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const newG = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const newB = Math.max(0, Math.round(rgb.b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}


export function getAccessibleBadgeStyles(backgroundColor: string): { 
  backgroundColor: string; 
  color: string; 
} {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return { backgroundColor, color: 'white' };
  
  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWithWhite = getContrastRatio(1.0, bgLuminance);
  const contrastWithBlack = getContrastRatio(0.0, bgLuminance);
  
  
  
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


export function getBadgeStyleString(backgroundColor: string): string {
  const styles = getAccessibleBadgeStyles(backgroundColor);
  return `background: ${styles.backgroundColor}; color: ${styles.color}`;
}