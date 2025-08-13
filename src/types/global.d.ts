// Global type declarations for the theme manager
declare global {
  interface Window {
    themeManager?: {
      initialized: boolean;
      init(): void;
      getInitialTheme(): string;
      applyTheme(theme: string): void;
      storeTheme(theme: string): void;
      setupSystemPreferenceListener(): void;
      toggle(): void;
      updateButtonLabel(): void;
      attachEventListener(): void;
      preserveThemeForNavigation(): void;
      restoreThemeAfterNavigation(): void;
    };
  }
}

export {};