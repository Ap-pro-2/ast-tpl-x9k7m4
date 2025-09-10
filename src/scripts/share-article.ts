/**
 * ShareArticle Script
 * 
 * External TypeScript file for handling social sharing functionality.
 * This script provides:
 * - Social media sharing (Facebook, Twitter, LinkedIn, WhatsApp, Telegram)
 * - Copy link to clipboard with user feedback
 * - Full TypeScript support and error handling
 * - Works with Astro view transitions
 */

// Enhanced ShareArticle Script with better error handling and UX
(function() {
  'use strict';
  
  function initShareButtons(): void {
    const shareButtons = document.querySelectorAll('.share-btn[data-platform]');
    
    shareButtons.forEach((button: Element) => {
      // Remove existing listeners to prevent duplicates
      const newButton = button.cloneNode(true) as HTMLButtonElement;
      button.parentNode?.replaceChild(newButton, button);
      
      newButton.addEventListener('click', handleShareClick);
    });
  }
  
  function handleShareClick(e: Event): void {
    e.preventDefault();
    
    const button = e.currentTarget as HTMLButtonElement;
    const platform = button.getAttribute('data-platform');
    const url = button.getAttribute('data-url');
    
    if (!platform) {
      return;
    }
    
    // Add loading state
    button.classList.add('loading');
    
    // Remove loading after animation
    setTimeout(() => {
      button.classList.remove('loading');
    }, 300);
    
    switch(platform) {
      case 'copy':
        if (url) {
          handleCopyLink(url, button);
        }
        break;
        
      default:
        if (url) {
          openSharePopup(url, platform);
        }
        break;
    }
  }
  
  function handleCopyLink(url: string, button: HTMLButtonElement): void {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern clipboard API
      navigator.clipboard.writeText(url).then(() => {
        showCopySuccess(button);
      }).catch(() => {
        fallbackCopyTextToClipboard(url, button);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyTextToClipboard(url, button);
    }
  }
  
  function openSharePopup(url: string, platform: string): void {
    const width = 600;
    const height = 500;
    const left = Math.round((window.screen.width - width) / 2);
    const top = Math.round((window.screen.height - height) / 2);
    
    const popup = window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
    
    // Focus the popup window
    if (popup) {
      popup.focus();
    }
  }
  
  function showCopySuccess(button: HTMLButtonElement): void {
    button.classList.add('copied');
    
    // Create tooltip with better feedback
    const tooltip = document.createElement('div');
    tooltip.textContent = '✓ Copied to clipboard!';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    tooltip.setAttribute('aria-atomic', 'true');
    tooltip.style.cssText = `
      position: absolute;
      top: -2.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    
    button.style.position = 'relative';
    button.appendChild(tooltip);
    
    setTimeout(() => {
      button.classList.remove('copied');
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 2000);
  }
  
  // Show error feedback for copy failures
  function showCopyError(button: HTMLButtonElement): void {
    const tooltip = document.createElement('div');
    tooltip.textContent = '✗ Copy failed';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    tooltip.style.cssText = `
      position: absolute;
      top: -2.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    
    button.style.position = 'relative';
    button.appendChild(tooltip);
    
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 3000);
  }
  
  function fallbackCopyTextToClipboard(text: string, button: HTMLButtonElement): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible but not hidden (for iOS)
    textArea.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 2em;
      height: 2em;
      padding: 0;
      border: none;
      outline: none;
      box-shadow: none;
      background: transparent;
      opacity: 0;
    `;
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopySuccess(button);
      } else {
        showCopyError(button);
      }
    } catch (err) {
      showCopyError(button);
    }
    
    document.body.removeChild(textArea);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareButtons);
  } else {
    initShareButtons();
  }
  
  // Re-initialize when navigating in Astro view transitions
  document.addEventListener('astro:page-load', initShareButtons);
  
  // Also expose for manual initialization if needed
  if (typeof window !== 'undefined') {
    (window as any).initShareButtons = initShareButtons;
  }
})();