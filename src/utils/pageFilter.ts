import type { CollectionEntry } from 'astro:content';

/**
 * Filter to only show published pages
 */
export function filterPublishedPages<T extends CollectionEntry<'pages'>>(entry: T): boolean {
  return entry.data.published === true;
}

/**
 * Check if a page is published by its slug
 */
export async function isPagePublished(pageSlug: string): Promise<boolean> {
  const { getCollection } = await import('astro:content');
  const allPages = await getCollection('pages');
  const pageData = allPages.find(p => p.data.slug === pageSlug);
  
  return pageData ? pageData.data.published : false;
}

/**
 * Get all published pages
 */
export async function getPublishedPagesOnly() {
  const { getCollection } = await import('astro:content');
  return await getCollection('pages', filterPublishedPages);
}