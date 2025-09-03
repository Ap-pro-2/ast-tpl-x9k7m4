/**
 * Header Script - Desktop Dropdowns and Mobile Sidebar
 * Optimized for performance and Astro view transitions
 */

class HeaderManager {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Initialize on DOM ready and after Astro page transitions
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    // Re-initialize after Astro view transitions
    document.addEventListener('astro:page-load', () => this.setup());
  }

  private setup(): void {
    // Prevent double initialization
    if (this.isInitialized) {
      this.cleanup();
    }

    this.initDesktopDropdowns();
    this.initMobileSidebar();
    this.isInitialized = true;
  }

  private cleanup(): void {
    // Reset initialization flag
    this.isInitialized = false;
    
    // Clear existing event listeners by removing data attributes
    // Event listeners will be automatically cleaned up when elements are replaced
    const dropdowns = document.querySelectorAll('.category-dropdown[data-initialized]');
    dropdowns.forEach(dropdown => {
      (dropdown as HTMLElement).removeAttribute('data-initialized');
    });

    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) {
      toggle.removeAttribute('data-initialized');
    }
  }

  /**
   * Desktop category dropdowns
   */
  private initDesktopDropdowns(): void {
    const dropdowns = document.querySelectorAll('.category-dropdown');
    
    dropdowns.forEach(dropdown => {
      const dropdownEl = dropdown as HTMLElement;
      
      // Skip if already initialized
      if (dropdownEl.dataset.initialized) return;
      dropdownEl.dataset.initialized = 'true';
      
      const menu = dropdown.querySelector('.category-dropdown-menu') as HTMLElement;
      const arrow = dropdown.querySelector('svg') as SVGElement;
      
      let timeout: ReturnType<typeof setTimeout>;
      
      const handleMouseEnter = (): void => {
        clearTimeout(timeout);
        if (menu) {
          menu.style.opacity = '1';
          menu.style.visibility = 'visible';
          menu.style.transform = 'translateY(0)';
        }
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      };
      
      const handleMouseLeave = (): void => {
        timeout = setTimeout(() => {
          if (menu) {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(8px)';
          }
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        }, 150);
      };
      
      dropdown.addEventListener('mouseenter', handleMouseEnter);
      dropdown.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /**
   * Simple mobile sidebar - Easy to understand
   */
  private initMobileSidebar(): void {
    const toggle = document.getElementById('mobile-menu-toggle') as HTMLElement;
    const menu = document.getElementById('mobile-menu') as HTMLElement;
    const sidebar = document.getElementById('mobile-sidebar') as HTMLElement;
    const close = document.getElementById('mobile-menu-close') as HTMLElement;

    if (!toggle || !menu || !sidebar || !close) {
      return;
    }

    // Skip if already initialized
    if (toggle.dataset.initialized) return;
    toggle.dataset.initialized = 'true';

    // Open menu
    const openMenu = (): void => {
      if (menu && sidebar) {
        menu.style.display = 'block';
        setTimeout(() => {
          sidebar.style.transform = 'translateX(0)';
        }, 10);
        document.body.style.overflow = 'hidden';
      }
    };

    // Close menu
    const closeMenu = (): void => {
      if (menu && sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
        setTimeout(() => {
          menu.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
      }
    };

    // Toggle button click
    const handleToggleClick = (): void => {
      if (menu && (menu.style.display === 'none' || !menu.style.display)) {
        openMenu();
      } else {
        closeMenu();
      }
    };

    // Click overlay to close
    const handleOverlayClick = (e: Event): void => {
      if (e.target === menu) {
        closeMenu();
      }
    };

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && menu && menu.style.display === 'block') {
        closeMenu();
      }
    };

    // Close on window resize
    const handleResize = (): void => {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    };

    // Add event listeners
    toggle.addEventListener('click', handleToggleClick);
    close.addEventListener('click', closeMenu);
    menu.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Close when clicking nav links
    if (sidebar) {
      const navLinks = sidebar.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
      });
    }
  }
}

// Initialize header manager
new HeaderManager();