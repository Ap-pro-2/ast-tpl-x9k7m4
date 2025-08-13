// src/utils/draftFilter.ts
import type { CollectionEntry } from 'astro:content';

/**
 * Standard draft filtering for blog posts
 * - Development: Show all posts (drafts and published)
 * - Production: Only show published posts
 */
export function filterDrafts<T extends CollectionEntry<'blog'>>(entry: T): boolean {
  return import.meta.env.PROD ? entry.data.status === 'published' : true;
}

/**
 * Filter to only show published posts (for RSS feeds, sitemaps, etc.)
 */
export function filterPublishedOnly<T extends CollectionEntry<'blog'>>(entry: T): boolean {
  return entry.data.status === 'published';
}

/**
 * Filter to only show draft posts (for draft previews)
 */
export function filterDraftsOnly<T extends CollectionEntry<'blog'>>(entry: T): boolean {
  return entry.data.status === 'draft';
}