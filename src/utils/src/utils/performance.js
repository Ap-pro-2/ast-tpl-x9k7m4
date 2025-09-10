
// Performance optimization utilities for Astro blog

/**
 * Lazy load images with intersection observer
 * Call this function after page load to optimize image loading
 */
export function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical resources based on user interaction
 */
export function initResourcePreloading() {
  // Preload next page on hover/focus
  const links = document.querySelectorAll('a[href^="/"]');
  
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        document.head.appendChild(prefetchLink);
      }
    }, { once: true });
  });
}

/**
 * Optimize font loading with font-display: swap fallback
 */
export function optimizeFontLoading() {
  // Add font-display: swap to any Google Fonts that don't have it
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    if (!link.href.includes('display=swap')) {
      link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
    }
  });
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLazyLoading();
      initResourcePreloading();
      optimizeFontLoading();
    });
  } else {
    initLazyLoading();
    initResourcePreloading();
    optimizeFontLoading();
  }
}

/**
 * Web Vitals monitoring (optional - for development)
 */
export function initWebVitalsMonitoring() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Monitor LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}
