/**
 * Enhanced Banner Ads System - Supports Image/HTML/Iframe ads with security
 * Features comprehensive type safety, validation, and security filtering
 */

import { getCollection, type CollectionEntry } from 'astro:content';

// Use Astro's inferred types from our enhanced Zod schema
export type AdsEntry = CollectionEntry<'ads'>;
export type AdsData = AdsEntry['data'];
export type BannerAd = AdsData['banners'][0];

// Enhanced ads configuration interface with security settings
export interface AdsConfig {
  global: {
    enabled: boolean;
    testMode?: boolean;
    security?: {
      allowHtmlAds?: boolean;
      allowIframeAds?: boolean;
      allowedIframeDomains?: string[];
    };
  };
  banners: BannerAd[];
}

// Type guards for different ad types
export function isImageAd(banner: BannerAd): banner is BannerAd & { type: 'image'; image: string; alt: string } {
  return banner.type === 'image' && !!banner.image && !!banner.alt;
}

export function isHtmlAd(banner: BannerAd): banner is BannerAd & { type: 'html'; htmlContent: string } {
  return banner.type === 'html' && !!banner.htmlContent;
}

export function isIframeAd(banner: BannerAd): banner is BannerAd & { type: 'iframe'; iframeUrl: string } {
  return banner.type === 'iframe' && !!banner.iframeUrl;
}

/**
 * Get ads configuration from content collection (with validation!)
 */
export async function getAdsConfig(): Promise<AdsConfig> {
  try {
    const adsCollection = await getCollection('ads');
    const adsEntry = adsCollection[0]; // ads.json is loaded as single entry
    
    if (!adsEntry) {
      return getDefaultAdsConfig();
    }
    
    return {
      global: adsEntry.data.global,
      banners: adsEntry.data.banners
    };
  } catch (error) {
    console.warn('Failed to load ads configuration:', error);
    return getDefaultAdsConfig();
  }
}

/**
 * Default ads configuration
 */
function getDefaultAdsConfig(): AdsConfig {
  return {
    global: {
      enabled: false,
      testMode: false
    },
    banners: []
  };
}

/**
 * Check if ads are globally enabled
 */
export async function areAdsEnabled(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.enabled;
}

/**
 * Get all enabled banner ads
 */
export async function getEnabledBanners(): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return [];
  
  return config.banners.filter(banner => banner.enabled);
}

/**
 * Get banner ad by ID
 */
export async function getBannerById(id: string): Promise<BannerAd | null> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return null;
  
  const banner = config.banners.find(b => b.id === id && b.enabled);
  return banner || null;
}

/**
 * Get banner ads by placement
 */
export async function getBannersByPlacement(placement: string): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return [];
  
  return config.banners.filter(banner => 
    banner.enabled && banner.placement === placement
  );
}

/**
 * Check if placement has any enabled ads
 */
export async function hasAdsForPlacement(placement: string): Promise<boolean> {
  const banners = await getBannersByPlacement(placement);
  return banners.length > 0;
}

/**
 * Security validation functions
 */

/**
 * Check if HTML ads are allowed in the current configuration
 */
export async function areHtmlAdsAllowed(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.security?.allowHtmlAds !== false; // Allow by default for backwards compatibility
}

/**
 * Check if iframe ads are allowed in the current configuration
 */
export async function areIframeAdsAllowed(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.security?.allowIframeAds === true; // Require explicit enabling
}

/**
 * Check if a specific iframe domain is allowed
 */
export async function isIframeDomainAllowed(url: string): Promise<boolean> {
  const config = await getAdsConfig();
  const allowedDomains = config.global.security?.allowedIframeDomains || [];
  
  if (allowedDomains.length === 0) {
    // If no specific domains are configured, allow any domain if iframe ads are enabled
    return await areIframeAdsAllowed();
  }
  
  try {
    const iframeUrl = new URL(url);
    return allowedDomains.includes(iframeUrl.hostname);
  } catch {
    return false;
  }
}

/**
 * Filter banners based on security settings
 */
export async function filterBannersBySecurity(banners: BannerAd[]): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  const securitySettings = config.global.security || {};
  
  return banners.filter(async (banner) => {
    switch (banner.type) {
      case 'html':
        return securitySettings.allowHtmlAds !== false;
      
      case 'iframe':
        if (!securitySettings.allowIframeAds) return false;
        
        // Check domain allowlist
        if (securitySettings.allowedIframeDomains?.length > 0 && banner.iframeUrl) {
          return await isIframeDomainAllowed(banner.iframeUrl);
        }
        
        return true;
      
      case 'image':
      default:
        return true;
    }
  });
}

/**
 * Enhanced banner fetching with security filtering
 */

/**
 * Get banner ads by placement with security filtering applied
 */
export async function getSecureBannersByPlacement(placement: string): Promise<BannerAd[]> {
  const banners = await getBannersByPlacement(placement);
  return await filterBannersBySecurity(banners);
}

/**
 * Get banner by ID with security validation
 */
export async function getSecureBannerById(id: string): Promise<BannerAd | null> {
  const banner = await getBannerById(id);
  if (!banner) return null;
  
  const filtered = await filterBannersBySecurity([banner]);
  return filtered.length > 0 ? banner : null;
}

/**
 * Validation helpers for different ad types
 */

/**
 * Validate image ad has required fields
 */
export function validateImageAd(banner: BannerAd): boolean {
  return banner.type === 'image' && !!banner.image && !!banner.alt;
}

/**
 * Validate HTML ad has required fields
 */
export function validateHtmlAd(banner: BannerAd): boolean {
  return banner.type === 'html' && !!banner.htmlContent;
}

/**
 * Validate iframe ad has required fields and URL is valid
 */
export function validateIframeAd(banner: BannerAd): boolean {
  if (banner.type !== 'iframe' || !banner.iframeUrl) return false;
  
  try {
    new URL(banner.iframeUrl);
    return true;
  } catch {
    return false;
  }
}