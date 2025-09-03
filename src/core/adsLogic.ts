/**
 * Simple Banner Ads System - Now with Zod validation and type safety
 * Only handles banner ads with images
 */

import { getCollection, type CollectionEntry } from 'astro:content';

// Use Astro's inferred types from our Zod schema
export type AdsEntry = CollectionEntry<'ads'>;
export type AdsData = AdsEntry['data'];
export type BannerAd = AdsData['banners'][0];

// For backwards compatibility, keep the old interface
export interface AdsConfig {
  global: {
    enabled: boolean;
    testMode?: boolean;
  };
  banners: BannerAd[];
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