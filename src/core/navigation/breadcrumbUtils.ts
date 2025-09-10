
import type { CollectionEntry } from 'astro:content';


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


export const breadcrumbConfig = {
  homeLabel: 'Home',
  blogLabel: 'Blog',
  categoriesLabel: 'Categories',
  tagsLabel: 'Tags',
  authorsLabel: 'Authors',
};


export function generateBreadcrumbs(
  pathname: string,
  pageData?: PageData
): BreadcrumbItem[] {
  try {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    
    if (pathname !== '/' && pathname !== '') {
      breadcrumbs.push({
        name: breadcrumbConfig.homeLabel,
        url: '/',
        position: 1
      });
    }

    
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    if (pathSegments.length === 0) {
      
      return [];
    }

    
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
        
        return handleGenericPaths(pathSegments, breadcrumbs, pageData);
    }
  } catch (error) {
    return [];
  }
}


function handleBlogPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  
  breadcrumbs.push({
    name: breadcrumbConfig.blogLabel,
    url: '/blog',
    position: breadcrumbs.length + 1
  });

  if (pathSegments.length === 1) {
    
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    
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


function handleCategoryPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  
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
    
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    
    const categoryName = pageData?.category?.name || decodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: categoryName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}


function handleTagPaths(
  pathSegments: string[],
  breadcrumbs: BreadcrumbItem[],
  pageData?: PageData
): BreadcrumbItem[] {
  
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
    
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    
    const tagName = pageData?.tags?.[0]?.name || decodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: tagName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}


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
    
    breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
    delete breadcrumbs[breadcrumbs.length - 1].url;
  } else if (pathSegments.length > 1) {
    
    const authorName = pageData?.author?.name || safeDecodeURIComponent(pathSegments[1]);
    breadcrumbs.push({
      name: authorName,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });
  }

  return breadcrumbs;
}


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

    
    if (post.data.category) {
      
      
      breadcrumbs.push({
        name: post.data.category.id, 
        url: `/categories/${post.data.category.id}`,
        position: 3
      });
    }

    
    breadcrumbs.push({
      name: post.data.title,
      isCurrentPage: true,
      position: breadcrumbs.length + 1
    });

    return breadcrumbs;
  } catch (error) {
    return [];
  }
}


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

    
    const categoryName = categoryData?.data.name || categoryId;
    breadcrumbs.push({
      name: categoryName,
      isCurrentPage: true,
      position: 4
    });

    return breadcrumbs;
  } catch (error) {
    return [];
  }
}


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

    
    const tagName = tagData?.data.name || tagSlug;
    breadcrumbs.push({
      name: tagName,
      isCurrentPage: true,
      position: 4
    });

    return breadcrumbs;
  } catch (error) {
    return [];
  }
}


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

    
    const authorName = authorData?.data.name || authorId;
    breadcrumbs.push({
      name: authorName,
      isCurrentPage: true,
      position: 3
    });

    return breadcrumbs;
  } catch (error) {
    return [];
  }
}


export function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    return str;
  }
}


export function validateBreadcrumbs(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items.filter(item => {
    
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      return false;
    }

    
    if (item.url !== undefined && typeof item.url !== 'string') {
      return false;
    }

    
    if (item.name === null) {
      return false;
    }

    return true;
  }).map((item, index) => ({
    ...item,
    position: index + 1 
  }));
}