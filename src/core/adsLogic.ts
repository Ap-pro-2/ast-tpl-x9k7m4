

import { getCollection, type CollectionEntry } from 'astro:content';


export type AdsEntry = CollectionEntry<'ads'>;
export type AdsData = AdsEntry['data'];
export type BannerAd = AdsData['banners'][0];


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


export function isImageAd(banner: BannerAd): banner is BannerAd & { type: 'image'; image: string; alt: string } {
  return banner.type === 'image' && !!banner.image && !!banner.alt;
}

export function isHtmlAd(banner: BannerAd): banner is BannerAd & { type: 'html'; htmlContent: string } {
  return banner.type === 'html' && !!banner.htmlContent;
}

export function isIframeAd(banner: BannerAd): banner is BannerAd & { type: 'iframe'; iframeUrl: string } {
  return banner.type === 'iframe' && !!banner.iframeUrl;
}


export async function getAdsConfig(): Promise<AdsConfig> {
  try {
    const adsCollection = await getCollection('ads');
    const adsEntry = adsCollection[0]; 
    
    if (!adsEntry) {
      return getDefaultAdsConfig();
    }
    
    return {
      global: adsEntry.data.global,
      banners: adsEntry.data.banners
    };
  } catch (error) {
    return getDefaultAdsConfig();
  }
}


function getDefaultAdsConfig(): AdsConfig {
  return {
    global: {
      enabled: false,
      testMode: false
    },
    banners: []
  };
}


export async function areAdsEnabled(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.enabled;
}


export async function getEnabledBanners(): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return [];
  
  return config.banners.filter(banner => banner.enabled);
}


export async function getBannerById(id: string): Promise<BannerAd | null> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return null;
  
  const banner = config.banners.find(b => b.id === id && b.enabled);
  return banner || null;
}


export async function getBannersByPlacement(placement: string): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  if (!config.global.enabled) return [];
  
  return config.banners.filter(banner => 
    banner.enabled && banner.placement === placement
  );
}


export async function hasAdsForPlacement(placement: string): Promise<boolean> {
  const banners = await getBannersByPlacement(placement);
  return banners.length > 0;
}




export async function areHtmlAdsAllowed(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.security?.allowHtmlAds !== false; 
}


export async function areIframeAdsAllowed(): Promise<boolean> {
  const config = await getAdsConfig();
  return config.global.security?.allowIframeAds === true; 
}


export async function isIframeDomainAllowed(url: string): Promise<boolean> {
  const config = await getAdsConfig();
  const allowedDomains = config.global.security?.allowedIframeDomains || [];
  
  if (allowedDomains.length === 0) {
    
    return await areIframeAdsAllowed();
  }
  
  try {
    const iframeUrl = new URL(url);
    return allowedDomains.includes(iframeUrl.hostname);
  } catch {
    return false;
  }
}


export async function filterBannersBySecurity(banners: BannerAd[]): Promise<BannerAd[]> {
  const config = await getAdsConfig();
  const securitySettings = config.global.security || {};
  
  return banners.filter(async (banner) => {
    switch (banner.type) {
      case 'html':
        return securitySettings.allowHtmlAds !== false;
      
      case 'iframe':
        if (!securitySettings.allowIframeAds) return false;
        
        
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




export async function getSecureBannersByPlacement(placement: string): Promise<BannerAd[]> {
  const banners = await getBannersByPlacement(placement);
  return await filterBannersBySecurity(banners);
}


export async function getSecureBannerById(id: string): Promise<BannerAd | null> {
  const banner = await getBannerById(id);
  if (!banner) return null;
  
  const filtered = await filterBannersBySecurity([banner]);
  return filtered.length > 0 ? banner : null;
}




export function validateImageAd(banner: BannerAd): boolean {
  return banner.type === 'image' && !!banner.image && !!banner.alt;
}


export function validateHtmlAd(banner: BannerAd): boolean {
  return banner.type === 'html' && !!banner.htmlContent;
}


export function validateIframeAd(banner: BannerAd): boolean {
  if (banner.type !== 'iframe' || !banner.iframeUrl) return false;
  
  try {
    new URL(banner.iframeUrl);
    return true;
  } catch {
    return false;
  }
}