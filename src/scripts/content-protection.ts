// Content Protection Script
// Disables text selection, copy, right-click, and common keyboard shortcuts

// Declare global settings interface
declare global {
  interface Window {
    contentProtectionSettings: {
      enabled: boolean;
      disableRightClick: boolean;
      disableTextSelection: boolean;
      disableKeyboardShortcuts: boolean;
    };
  }
}

export function initContentProtection(): void {
  // Get settings from global window object (set by Astro)
  const settings = window.contentProtectionSettings || {
    enabled: true,
    disableRightClick: true,
    disableTextSelection: true,
    disableKeyboardShortcuts: true
  };

  if (!settings.enabled) return;

  // Disable text selection
  if (settings.disableTextSelection) {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // Disable drag and drop
    document.addEventListener('dragstart', (e: Event) => {
      e.preventDefault();
      return false;
    });

    // Disable text selection on mouse events
    document.addEventListener('selectstart', (e: Event) => {
      e.preventDefault();
      return false;
    });

    // Additional CSS to prevent text selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }

      /* Prevent image dragging */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Disable right-click context menu
  if (settings.disableRightClick) {
    document.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
      return false;
    });
  }

  // Disable common copy/paste keyboard shortcuts
  if (settings.disableKeyboardShortcuts) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+V (Paste)
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+X (Cut)
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    });
  }

  console.log('Content protection enabled with settings:', settings);
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Wait for settings to be available and DOM to be ready
  const initWhenReady = () => {
    if (window.contentProtectionSettings && document.readyState !== 'loading') {
      initContentProtection();
    } else {
      setTimeout(initWhenReady, 10);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }

  // Reinitialize after Astro view transitions
  document.addEventListener('astro:page-load', initContentProtection);
}