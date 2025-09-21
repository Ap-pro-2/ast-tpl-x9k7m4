import { getCollection, type CollectionEntry } from 'astro:content';

export type ShortcodeEntry = CollectionEntry<'shortcodes'>;
export type ShortcodeData = ShortcodeEntry['data'];

export interface ShortcodeProduct {
  productId: string;
  variant: 'sidebar' | 'card' | 'compact';
  title?: string;
}

export interface ShortcodeConfig {
  id: string;
  articleSlug: string;
  placement: 'sidebar' | 'content';
  priority: number;
  enabled: boolean;
  title?: string;
  products: ShortcodeProduct[];
}

/**
 * Get all shortcodes for a specific article
 */
export async function getShortcodesForArticle(articleSlug: string): Promise<ShortcodeConfig[]> {
  try {
    const shortcodes = await getCollection('shortcodes');

    return shortcodes
      .map(entry => entry.data)
      .filter(shortcode =>
        shortcode.enabled &&
        shortcode.articleSlug === articleSlug
      )
      .sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.warn('Error loading shortcodes:', error);
    return [];
  }
}

/**
 * Get sidebar shortcodes for a specific article
 */
export async function getSidebarShortcodesForArticle(articleSlug: string): Promise<ShortcodeConfig[]> {
  const shortcodes = await getShortcodesForArticle(articleSlug);
  return shortcodes.filter(shortcode => shortcode.placement === 'sidebar');
}

/**
 * Get content shortcodes for a specific article
 */
export async function getContentShortcodesForArticle(articleSlug: string): Promise<ShortcodeConfig[]> {
  const shortcodes = await getShortcodesForArticle(articleSlug);
  return shortcodes.filter(shortcode => shortcode.placement === 'content');
}

/**
 * Check if an article has sidebar shortcodes
 */
export async function hasSidebarShortcodes(articleSlug: string): Promise<boolean> {
  const sidebarShortcodes = await getSidebarShortcodesForArticle(articleSlug);
  return sidebarShortcodes.length > 0;
}

/**
 * Check if an article has content shortcodes
 */
export async function hasContentShortcodes(articleSlug: string): Promise<boolean> {
  const contentShortcodes = await getContentShortcodesForArticle(articleSlug);
  return contentShortcodes.length > 0;
}

/**
 * Get all enabled shortcodes
 */
export async function getAllEnabledShortcodes(): Promise<ShortcodeConfig[]> {
  try {
    const shortcodes = await getCollection('shortcodes');

    return shortcodes
      .map(entry => entry.data)
      .filter(shortcode => shortcode.enabled)
      .sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.warn('Error loading shortcodes:', error);
    return [];
  }
}

/**
 * Get shortcode by ID
 */
export async function getShortcodeById(id: string): Promise<ShortcodeConfig | null> {
  try {
    const shortcodes = await getCollection('shortcodes');
    const shortcode = shortcodes.find(entry => entry.data.id === id);

    return shortcode?.data.enabled ? shortcode.data : null;
  } catch (error) {
    console.warn('Error loading shortcode:', error);
    return null;
  }
}

/**
 * Validate that all products in a shortcode exist
 */
export async function validateShortcodeProducts(shortcode: ShortcodeConfig): Promise<boolean> {
  try {
    const affiliateProducts = await getCollection('affiliateProducts');
    const productIds = affiliateProducts.map(product => product.id);

    return shortcode.products.every(product =>
      productIds.includes(product.productId)
    );
  } catch (error) {
    console.warn('Error validating shortcode products:', error);
    return false;
  }
}

/**
 * Get shortcodes grouped by article slug
 */
export async function getShortcodesByArticle(): Promise<Record<string, ShortcodeConfig[]>> {
  const allShortcodes = await getAllEnabledShortcodes();

  return allShortcodes.reduce((acc, shortcode) => {
    if (!acc[shortcode.articleSlug]) {
      acc[shortcode.articleSlug] = [];
    }
    acc[shortcode.articleSlug].push(shortcode);
    return acc;
  }, {} as Record<string, ShortcodeConfig[]>);
}

/**
 * Get summary of shortcode usage
 */
export async function getShortcodeSummary(): Promise<{
  totalShortcodes: number;
  enabledShortcodes: number;
  articlesWithShortcodes: number;
  sidebarShortcodes: number;
  contentShortcodes: number;
}> {
  try {
    const allShortcodes = await getCollection('shortcodes');
    const enabledShortcodes = allShortcodes.filter(entry => entry.data.enabled);
    const uniqueArticles = new Set(enabledShortcodes.map(entry => entry.data.articleSlug));

    const sidebarCount = enabledShortcodes.filter(entry => entry.data.placement === 'sidebar').length;
    const contentCount = enabledShortcodes.filter(entry => entry.data.placement === 'content').length;

    return {
      totalShortcodes: allShortcodes.length,
      enabledShortcodes: enabledShortcodes.length,
      articlesWithShortcodes: uniqueArticles.size,
      sidebarShortcodes: sidebarCount,
      contentShortcodes: contentCount
    };
  } catch (error) {
    console.warn('Error getting shortcode summary:', error);
    return {
      totalShortcodes: 0,
      enabledShortcodes: 0,
      articlesWithShortcodes: 0,
      sidebarShortcodes: 0,
      contentShortcodes: 0
    };
  }
}