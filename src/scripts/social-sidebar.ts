/**
 * Social Media Sidebar Boundary Control
 * Handles smooth hiding/showing of social media buttons when they overlap with header
 */

interface SocialSidebarManager {
  sidebar: HTMLElement | null;
  hideTimeout: ReturnType<typeof setTimeout> | null;
  isScrolling: boolean;
  
  init(): void;
  checkHeaderBoundary(): void;
  handleScroll(): void;
  cleanup(): void;
}

class SocialSidebarController implements SocialSidebarManager {
  sidebar: HTMLElement | null = null;
  hideTimeout: ReturnType<typeof setTimeout> | null = null;
  isScrolling = false;

  init(): void {
    this.sidebar = document.querySelector<HTMLElement>('.share-sidebar');
    if (!this.sidebar) return;
    
    this.handleScroll = this.handleScroll.bind(this);
    this.checkHeaderBoundary = this.checkHeaderBoundary.bind(this);
    
    window.addEventListener('scroll', this.handleScroll);
    this.checkHeaderBoundary();
  }

  checkHeaderBoundary(): void {
    const header = document.querySelector<HTMLElement>('header');
    if (!header || !this.sidebar) return;
    
    const headerRect = header.getBoundingClientRect();
    const sidebarRect = this.sidebar.getBoundingClientRect();
    
    // Clear any pending timeout
    if (this.hideTimeout !== null) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // If sidebar is overlapping with header, hide it smoothly
    if (sidebarRect.top < headerRect.bottom + 15) {
      this.sidebar.classList.add('hidden');
    } else {
      // Small delay before showing to prevent flickering
      this.hideTimeout = setTimeout(() => {
        if (this.sidebar) {
          this.sidebar.classList.remove('hidden');
        }
      }, 100);
    }
  }

  handleScroll(): void {
    if (!this.isScrolling) {
      requestAnimationFrame(() => {
        this.checkHeaderBoundary();
        this.isScrolling = false;
      });
      this.isScrolling = true;
    }
  }

  cleanup(): void {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.hideTimeout !== null) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}

// Initialize when DOM is ready
function initSocialSidebar(): void {
  const controller = new SocialSidebarController();
  controller.init();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    controller.cleanup();
  });
  
  // Reinitialize on Astro page transitions
  document.addEventListener('astro:page-load', () => {
    controller.init();
  });
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocialSidebar);
} else {
  initSocialSidebar();
}

export default SocialSidebarController;