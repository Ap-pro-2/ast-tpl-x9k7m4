/**
 * Transition Utilities
 * Generates CSS for page transitions based on theme settings
 */

import type { ThemeConfig } from '../config/theme';

// Speed mappings
const speedMappings = {
  fast: '0.2s',
  medium: '0.4s',
  slow: '0.6s'
};

// Generate page transition animations
function getPageTransitionCSS(style: string, speed: string): string {
  const duration = speedMappings[speed as keyof typeof speedMappings] || '0.4s';

  switch (style) {
    case 'smooth':
      return `
        @keyframes smooth-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes smooth-fade-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
          }
        }

        ::view-transition-old(root) {
          animation: smooth-fade-out ${duration} cubic-bezier(0.4, 0, 0.2, 1);
        }

        ::view-transition-new(root) {
          animation: smooth-fade-in ${duration} cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;

    case 'dynamic':
      return `
        @keyframes dynamic-slide-in {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes dynamic-slide-out {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50px);
          }
        }

        ::view-transition-old(root) {
          animation: dynamic-slide-out ${duration} ease-out;
        }

        ::view-transition-new(root) {
          animation: dynamic-slide-in ${duration} ease-out;
        }
      `;

    case 'minimal':
      return `
        @keyframes minimal-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes minimal-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        ::view-transition-old(root) {
          animation: minimal-fade-out ${duration} ease;
        }

        ::view-transition-new(root) {
          animation: minimal-fade-in ${duration} ease;
        }
      `;

    case 'creative':
      return `
        @keyframes creative-rotate-in {
          from {
            opacity: 0;
            transform: rotate(-5deg) scale(0.95);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes creative-rotate-out {
          from {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
          to {
            opacity: 0;
            transform: rotate(5deg) scale(0.95);
          }
        }

        ::view-transition-old(root) {
          animation: creative-rotate-out ${duration} cubic-bezier(0.4, 0, 0.2, 1);
        }

        ::view-transition-new(root) {
          animation: creative-rotate-in ${duration} cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;

    case 'luxury':
      return `
        @keyframes luxury-blur-in {
          from {
            opacity: 0;
            filter: blur(2px);
            transform: scale(1.02);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }

        @keyframes luxury-blur-out {
          from {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
          to {
            opacity: 0;
            filter: blur(2px);
            transform: scale(0.98);
          }
        }

        ::view-transition-old(root) {
          animation: luxury-blur-out ${duration} ease-in-out;
        }

        ::view-transition-new(root) {
          animation: luxury-blur-in ${duration} ease-in-out;
        }
      `;

    case 'none':
      return `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
        }
      `;

    default:
      // Default to smooth
      return getPageTransitionCSS('smooth', speed);
  }
}

// Header transitions removed - header is now clean and simple

// Generate loading indicator CSS
function getLoadingIndicatorCSS(style: string): string {
  switch (style) {
    case 'progress':
      return `
        .page-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(
            90deg,
            var(--color-primary),
            var(--color-primary-light)
          );
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 9999;
        }

        .page-loading.show {
          animation: loading-bar 1s ease-in-out infinite;
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `;

    case 'pulse':
      return `
        .page-loading {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: var(--color-primary);
          border-radius: 50%;
          z-index: 9999;
        }

        .page-loading.show {
          animation: loading-pulse 1s ease-in-out infinite;
        }

        @keyframes loading-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `;

    case 'spinner':
      return `
        .page-loading {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-primary);
          border-top: 2px solid transparent;
          border-radius: 50%;
          z-index: 9999;
        }

        .page-loading.show {
          animation: loading-spin 1s linear infinite;
        }

        @keyframes loading-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `;

    case 'line':
      return `
        .page-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--color-primary);
          transform: scaleX(0);
          transform-origin: left;
          z-index: 9999;
        }

        .page-loading.show {
          animation: loading-line 0.8s ease-out;
        }

        @keyframes loading-line {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `;

    case 'none':
      return `
        .page-loading {
          display: none;
        }
      `;

    default:
      return getLoadingIndicatorCSS('progress');
  }
}

// Generate accessibility CSS
function getAccessibilityCSS(): string {
  return `
    /* Respect user's motion preferences */
    @media (prefers-reduced-motion: reduce) {
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none !important;
      }
      
      .page-loading.show {
        animation: none !important;
      }
    }
  `;
}

// Main function to generate all transition CSS
export function generateTransitionCSS(theme: ThemeConfig): string {
  const { pageStyle, speed, loadingStyle } = theme.transitions;

  return `
    /* Generated Transition Styles */
    ${getPageTransitionCSS(pageStyle, speed)}
    ${getLoadingIndicatorCSS(loadingStyle)}
    ${getAccessibilityCSS()}
  `;
}

// Export individual functions for advanced usage
export {
  getPageTransitionCSS,
  getLoadingIndicatorCSS,
  getAccessibilityCSS
};