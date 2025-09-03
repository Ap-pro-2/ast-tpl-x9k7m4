/**
 * Theme Switcher Script
 * Modal-based theme switcher functionality for demo purposes
 * Compatible with Astro view transitions
 */

interface ThemeConfig {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  primaryAccessible?: string;
  primaryAccessibleDark?: string;
  textMutedAccessible?: string;
  bgContrastSafe?: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  surfaceCard: string;
  surfaceOverlay: string;
  borderDefault: string;
  borderLight: string;
  borderAccent: string;
}

type ThemeName = string;

class ThemeSwitcherManager {
  private isInitialized = false;
  
  // Theme configurations for demo
  private demoThemes: Record<ThemeName, ThemeConfig> = {
    professional: {
      primary: "#3B82F6",
      primaryLight: "#60A5FA",
      primaryDark: "#1D4ED8",
      secondary: "#6B7280",
      accent: "#10B981",
      primaryAccessible: "#1D4ED8",
      primaryAccessibleDark: "#1E40AF",
      textMutedAccessible: "#4B5563",
      bgContrastSafe: "#F8F9FA",
      textPrimary: "#111827",
      textSecondary: "#374151",
      textMuted: "#6B7280",
      textAccent: "#3B82F6",
      bgPrimary: "#FFFFFF",
      bgSecondary: "#F9FAFB",
      bgTertiary: "#F3F4F6",
      surfaceCard: "#FFFFFF",
      surfaceOverlay: "#F9FAFB",
      borderDefault: "#E5E7EB",
      borderLight: "#F3F4F6",
      borderAccent: "#D1D5DB",
    },

    dark: {
      primary: "#60A5FA",
      primaryLight: "#93C5FD",
      primaryDark: "#3B82F6",
      secondary: "#6B7280",
      accent: "#10B981",
      primaryAccessible: "#93C5FD",
      primaryAccessibleDark: "#BFDBFE",
      textMutedAccessible: "#D1D5DB",
      bgContrastSafe: "#1F2937",
      textPrimary: "#F9FAFB",
      textSecondary: "#D1D5DB",
      textMuted: "#9CA3AF",
      textAccent: "#60A5FA",
      bgPrimary: "#111827",
      bgSecondary: "#1F2937",
      bgTertiary: "#374151",
      surfaceCard: "#1F2937",
      surfaceOverlay: "#374151",
      borderDefault: "#374151",
      borderLight: "#4B5563",
      borderAccent: "#6B7280",
    },

    coffee: {
      primary: "#8B4513",
      primaryLight: "#A0522D",
      primaryDark: "#654321",
      secondary: "#6B5B73",
      accent: "#D2691E",
      textPrimary: "#1A0F0A",
      textSecondary: "#2F1B14",
      textMuted: "#5D4037",
      textAccent: "#8B4513",
      bgPrimary: "#FFF8F0",
      bgSecondary: "#F5F0E8",
      bgTertiary: "#EDE4D3",
      surfaceCard: "#FEFCF7",
      surfaceOverlay: "#F8F3E9",
      borderDefault: "#D4C4A8",
      borderLight: "#E8DCC6",
      borderAccent: "#C4A484",
      primaryAccessible: "#4A2C17",
      primaryAccessibleDark: "#3D2817",
      textMutedAccessible: "#3D2817",
      bgContrastSafe: "#F2EDE3",
    },

    // Add more themes as needed (truncated for brevity)
    nature: {
      primary: "#10B981",
      primaryLight: "#34D399",
      primaryDark: "#059669",
      secondary: "#6B7280",
      accent: "#F59E0B",
      primaryAccessible: "#059669",
      primaryAccessibleDark: "#047857",
      textMutedAccessible: "#4B5563",
      bgContrastSafe: "#F8F9FA",
      textPrimary: "#111827",
      textSecondary: "#374151",
      textMuted: "#6B7280",
      textAccent: "#10B981",
      bgPrimary: "#FFFFFF",
      bgSecondary: "#F9FAFB",
      bgTertiary: "#F3F4F6",
      surfaceCard: "#FFFFFF",
      surfaceOverlay: "#F9FAFB",
      borderDefault: "#E5E7EB",
      borderLight: "#F3F4F6",
      borderAccent: "#D1D5DB",
    },
  };

  constructor() {
    this.init();
  }

  private init(): void {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    // Re-initialize after Astro page transitions
    document.addEventListener('astro:page-load', () => this.setup());
  }

  private setup(): void {
    // Prevent double initialization
    if (this.isInitialized) {
      return;
    }

    this.initThemeSwitcher();
    this.isInitialized = true;
  }

  private initThemeSwitcher(): void {
    // Load saved theme or default to coffee
    const savedTheme = localStorage.getItem('demo-theme') || 'coffee';
    this.applyTheme(savedTheme);

    // Modal trigger button
    const triggerBtn = document.getElementById('theme-switcher-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.openModal());
    }

    // Modal close button
    const closeBtn = document.getElementById('theme-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Modal overlay click to close
    const overlay = document.getElementById('theme-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal();
        }
      });
    }

    // Theme option buttons
    const themeButtons = document.querySelectorAll('.theme-option');
    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const themeName = (button as HTMLElement).dataset.theme;
        if (themeName) {
          this.applyTheme(themeName);

          // Add a subtle animation feedback
          (button as HTMLElement).style.transform = 'scale(0.95)';
          setTimeout(() => {
            (button as HTMLElement).style.transform = '';
          }, 150);

          // Close modal after selection
          setTimeout(() => {
            this.closeModal();
          }, 300);
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  private applyTheme(themeName: ThemeName): void {
    const theme = this.demoThemes[themeName];
    if (!theme) return;

    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme).forEach(([key, value]) => {
      // Convert camelCase to kebab-case and add appropriate prefix
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();

      if (key.startsWith('text')) {
        root.style.setProperty(`--${cssVar}`, value);
      } else if (key.startsWith('bg')) {
        root.style.setProperty(`--${cssVar}`, value);
      } else if (key.startsWith('surface')) {
        root.style.setProperty(`--${cssVar}`, value);
      } else if (key.startsWith('border')) {
        root.style.setProperty(`--${cssVar}`, value);
      } else {
        // For primary, secondary, accent colors
        root.style.setProperty(`--color-${cssVar}`, value);
      }
    });

    // Auto-generate accessible color variants if not provided
    const primaryAccessible = theme.primaryAccessible || theme.primaryDark || theme.primary;
    const primaryAccessibleDark = theme.primaryAccessibleDark || theme.primaryDark || theme.primary;
    const textMutedAccessible = theme.textMutedAccessible || theme.textSecondary || theme.textMuted;
    const bgContrastSafe = theme.bgContrastSafe || theme.bgSecondary || theme.bgTertiary;

    // Apply accessible color variants
    root.style.setProperty('--color-primary-accessible', primaryAccessible);
    root.style.setProperty('--color-primary-accessible-dark', primaryAccessibleDark);
    root.style.setProperty('--text-muted-accessible', textMutedAccessible);
    root.style.setProperty('--bg-contrast-safe', bgContrastSafe);

    // Store current theme
    localStorage.setItem('demo-theme', themeName);

    // Update active state
    this.updateActiveTheme(themeName);
  }

  private updateActiveTheme(themeName: ThemeName): void {
    const buttons = document.querySelectorAll('.theme-option');
    buttons.forEach((button) => {
      button.classList.remove('active');
      if ((button as HTMLElement).dataset.theme === themeName) {
        button.classList.add('active');
      }
    });
  }

  private openModal(): void {
    const overlay = document.getElementById('theme-modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  private closeModal(): void {
    const overlay = document.getElementById('theme-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Public API for external use
  public getCurrentTheme(): string {
    return localStorage.getItem('demo-theme') || 'coffee';
  }

  public getAvailableThemes(): string[] {
    return Object.keys(this.demoThemes);
  }
}

// Initialize theme switcher manager
const themeSwitcher = new ThemeSwitcherManager();

// Export for potential external use
if (typeof window !== 'undefined') {
  (window as any).demoThemeSwitcher = {
    applyTheme: (theme: string) => themeSwitcher.getCurrentTheme(),
    availableThemes: themeSwitcher.getAvailableThemes(),
    getCurrentTheme: () => themeSwitcher.getCurrentTheme(),
  };
}