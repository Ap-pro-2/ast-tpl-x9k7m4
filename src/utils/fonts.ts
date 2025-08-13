/**
 * Dynamic Google Fonts Utility
 * Automatically generates Google Fonts URLs from theme settings
 */

export interface FontConfig {
    fontHeading: string;
    fontBody: string;
    fontMono: string;
}

/**
 * Extract Google Font names from font family strings
 */
function extractGoogleFontName(fontFamily: string): string | null {
    // Match quoted font names like "Roboto Slab", "Open Sans", "Inter"
    const match = fontFamily.match(/^"([^"]+)"/);
    if (match) {
        const fontName = match[1];
        // Skip system fonts and common fallbacks
        const systemFonts = [
            'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace',
            'Arial', 'Helvetica', 'Times', 'Times New Roman', 'Courier', 'Courier New',
            'Georgia', 'Verdana', 'Monaco', 'Menlo', 'Consolas'
        ];

        if (!systemFonts.includes(fontName)) {
            return fontName;
        }
    }
    return null;
}

/**
 * Generate Google Fonts URL from font configuration
 */
export function generateGoogleFontsURL(fontConfig: FontConfig): string | null {
    const googleFonts: string[] = [];

    // Extract Google Font names
    const headingFont = extractGoogleFontName(fontConfig.fontHeading);
    const bodyFont = extractGoogleFontName(fontConfig.fontBody);
    const monoFont = extractGoogleFontName(fontConfig.fontMono);

    // Collect unique Google Fonts
    const uniqueFonts = new Set<string>();

    if (headingFont) uniqueFonts.add(headingFont);
    if (bodyFont) uniqueFonts.add(bodyFont);
    if (monoFont) uniqueFonts.add(monoFont);

    if (uniqueFonts.size === 0) {
        return null; // No Google Fonts needed
    }

    // Build Google Fonts URL
    const fontParams = Array.from(uniqueFonts).map(font => {
        // Convert font name to URL format and add common weights
        const urlFont = font.replace(/\s+/g, '+');
        return `family=${urlFont}:wght@400;500;600;700;800`;
    }).join('&');

    return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

/**
 * Get preconnect URLs for Google Fonts
 */
export function getGoogleFontsPreconnects(): string[] {
    return [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
}

/**
 * Check if any Google Fonts are being used
 */
export function hasGoogleFonts(fontConfig: FontConfig): boolean {
    return generateGoogleFontsURL(fontConfig) !== null;
}