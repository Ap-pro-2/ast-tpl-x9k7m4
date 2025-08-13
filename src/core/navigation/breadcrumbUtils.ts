// src/components/navigation/breadcrumbUtils.ts
import type { CollectionEntry } from 'astro:content';

// Core interfaces for breadcrumb data structures
export interface BreadcrumbItem {
  name: string;
  url?: string;
  isCurrentPage?: boolean;
  position?: number;
}

export interface PageData {
  title?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug?: string;
  }>;
  author?: {
    id: string;
    name: string;
  };
}

// Configuration for breadcrumb labels
export const breadcrumbConfig = {
  homeLabel: 'Home',
  blogLabel: 'Blog',
  categoriesLabel: 'Categories',
  tagsLabel: 'Tags',
  authorsLabel: 'Authors',
};

/**
 * Generate breadcrumbs based on current page context
 * @param pathname - Current page pathname
 * @param pageData - Optional page data for context
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(
  pathname: string,
  pageData?: PageData
): BreadcrumbItem[] {
  try {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with Home (except for homepage)
    if (pathname !== '/' && pathname !== '') {
      breadcrumbs.push({
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      });
    }

    // Parse pathname to determine page type
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    if (pathSegments.length === 0) {
      // Homepage - no breadcrumbs
      return [];
    }

    // Handle different page types based on URL structure
    const firstSegment = pathSegments[0];
    
    switch (firstSegment) {
      case 'blog':
        return handleBlogPaths(pathSegments, breadcrumbs, pageData);
      case 'categories':
        return handleCategoryPaths(pathSegments, breadcrumbs, pageData);
      case 'tags':
        return handleTagPaths(pathSegments, breadcrumbs, pageData);
      case 'authors':
        return handleAuthorPaths(pathSegments, breadcrumbs, pageData);
      case 'legal':
        return handleLegalPaths(pathSegments, breadcrumbs, pageData);
      default:
        // Generic page
        return handleGenericPaths(pathSegments, breadcrumbs, pageData);
    }
  } catch (error) {
    console.warn('Error generating breadcrumbs:', error);
    return [];
  }
}

/**
 * Handle blog-related paths
 */
function handleBlogPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  // Add Blog to breadcrumbs
  breadcrumbs.push({
    name: breadcrumbConfig.blogLabel,
    url: '/blog',
    position: breadcrumbs.length + 1
  });

  if (pathSegments.length === 1) {
    // Blog index page
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    // Individual blog post
    if (pageData?.category) {
      breadcrumbs.push({
        name: pageData.category.name,
        url: `/categories/${pageData.category.slug || pageData.category.id}`,
        position: breadcrumbs.length + 1
      });
    }
    
    if (pageData?.title) {
      breadcrumbs.push({
        name: pageData.title,
        isCurrentPage: true,
        position: breadcrumbs.length + 1
      });
    }
  }

  return breadcrumbs;
}

/**
 * Handle category-related paths
 */
function handleCategoryPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  // Add Blog > Categories to breadcrumbs
  breadcrumbs.push({
    name: breadcrumbConfig.blogLabel,
    url: '/blog',
    position: breadcrumbs.length + 1
  });

  breadcrumbs.push({
    name: breadcrumbConfig.categoriesLabel,
    url: '/categories',
    position: breadcrumbs.length + 1
  });

  if (pathSegments.length === 1) {
    // Categories index page
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    // Individual category page
    const categoryName = pageData?.category?.name || decodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: categoryName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}

/**
 * Handle tag-related paths
 */
function handleTagPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  // Add Blog > Tags to breadcrumbs
  breadcrumbs.push({
    name: breadcrumbConfig.blogLabel,
    url: '/blog',
    position: breadcrumbs.length + 1
  });

  breadcrumbs.push({
    name: breadcrumbConfig.tagsLabel,
    url: '/tags',
    position: breadcrumbs.length + 1
  });

  if (pathSegments.length === 1) {
    // Tags index page
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    // Individual tag page
    const tagName = pageData?.tags?.[0]?.name || decodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: tagName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}

/**
 * Handle author-related paths
 */
function handleAuthorPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  breadcrumbs.push({
    name: breadcrumbConfig.authorsLabel,
    url: '/authors',
    position: breadcrumbs.length + 1
  });

  if (pathSegments.length === 1) {
    // Authors index page
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    // Individual author page
    const authorName = pageData?.author?.name || safeDecodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: authorName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}

/**
 * Handle legal pages
 */
function handleLegalPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  if (pathSegments.length > 1) {
    const pageName = pageData?.title || decodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: pageName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}

/**
 * Handle generic pages
 */
function handleGenericPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  const pageName = pageData?.title || decodeURIComponent(pathSegments[pathSegments.length - 1]);
  breadcrumbs.push({
    name: pageName,
    isCurrentPage: true,
    position: breadcrumbs.length + 1
  });

  return breadcrumbs;
}
/**

 * Get breadcrumbs for blog posts
 * @param post - Blog post collection entry
 * @returns Array of breadcrumb items
 */
export function getBlogPostBreadcrumbs(
  post: CollectionEntry<'blog'>
): BreadcrumbItem[] {
  try {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      },
      {
        name: breadcrumbConfig.blogLabel,
        url: '/blog',
        position: 2
      }
    ];

    // Add category if available
    if (post.data.category) {
      // Note: We'll need to resolve the category reference
      // For now, we'll use the category ID as a fallback
      breadcrumbs.push({
        name: post.data.category.id, // This will be resolved with actual category data
        url: `/categories/${post.data.category.id}`,
        position: 3
      });
    }

    // Add post title as current page
    breadcrumbs.push({
      name: post.data.title,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });

    return breadcrumbs;
  } catch (error) {
    console.warn('Error generating blog post breadcrumbs:', error);
    return [];
  }
}

/**
 * Get breadcrumbs for category pages
 * @param categoryId - Category identifier
 * @param categoryData - Optional category collection entry
 * @returns Array of breadcrumb items
 */
export function getCategoryBreadcrumbs(
  categoryId: string,
  categoryData?: CollectionEntry<'categories'>
): BreadcrumbItem[] {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      },
      {
        name: breadcrumbConfig.blogLabel,
        url: '/blog',
        position: 2
      },
      {
        name: breadcrumbConfig.categoriesLabel,
        url: '/categories',
        position: 3
      }
    ];

    // Add category name as current page
    const categoryName = categoryData?.data.name || categoryId;
    breadcrumbs.push({
      name: categoryName,
      isCurrentPage: true,
      position: 4
    });

    return breadcrumbs;
  } catch (error) {
    console.warn('Error generating category breadcrumbs:', error);
    return [];
  }
}

/**
 * Get breadcrumbs for tag pages
 * @param tagId - Tag identifier
 * @param tagData - Optional tag collection entry
 * @returns Array of breadcrumb items
 */
export function getTagBreadcrumbs(
  tagSlug: string,
  tagData?: CollectionEntry<'tags'>
): BreadcrumbItem[] {
  try {
    if (!tagSlug) {
      throw new Error('Tag slug is required');
    }

    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      },
      {
        name: breadcrumbConfig.blogLabel,
        url: '/blog',
        position: 2
      },
      {
        name: breadcrumbConfig.tagsLabel,
        url: '/tags',
        position: 3
      }
    ];

    // Add tag name as current page
    const tagName = tagData?.data.name || tagSlug;
    breadcrumbs.push({
      name: tagName,
      isCurrentPage: true,
      position: 4
    });

    return breadcrumbs;
  } catch (error) {
    console.warn('Error generating tag breadcrumbs:', error);
    return [];
  }
}

/**
 * Get breadcrumbs for author pages
 * @param authorId - Author identifier
 * @param authorData - Optional author collection entry
 * @returns Array of breadcrumb items
 */
export function getAuthorBreadcrumbs(
  authorId: string,
  authorData?: CollectionEntry<'authors'>
): BreadcrumbItem[] {
  try {
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      },
      {
        name: breadcrumbConfig.authorsLabel,
        url: '/authors',
        position: 2
      }
    ];

    // Add author name as current page
    const authorName = authorData?.data.name || authorId;
    breadcrumbs.push({
      name: authorName,
      isCurrentPage: true,
      position: 3
    });

    return breadcrumbs;
  } catch (error) {
    console.warn('Error generating author breadcrumbs:', error);
    return [];
  }
}

/**
 * Utility function to safely decode URI components
 * @param str - String to decode
 * @returns Decoded string or original if decoding fails
 */
export function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    console.warn('Failed to decode URI component:', str, error);
    return str;
  }
}

/**
 * Utility function to validate breadcrumb items
 * @param items - Array of breadcrumb items to validate
 * @returns Validated and cleaned breadcrumb items
 */
export function validateBreadcrumbs(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items.filter(item => {
    // Ensure item has a name
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      console.warn('Invalid breadcrumb item: missing or empty name', item);
      return false;
    }

    // Validate URL if present
    if (item.url !== undefined && typeof item.url !== 'string') {
      console.warn('Invalid breadcrumb item: invalid URL type', item);
      return false;
    }

    // Filter out items with null names
    if (item.name === null) {
      console.warn('Invalid breadcrumb item: null name', item);
      return false;
    }

    return true;
  }).map((item, index) => ({
    ...item,
    position: index + 1 // Ensure positions are sequential
  }));
}