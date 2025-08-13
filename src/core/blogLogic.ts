// src/core/blogLogic.ts
// ALL CORE BLOG LOGIC IN ONE FILE - UI INDEPENDENT

import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { filterDrafts, filterPublishedOnly } from '../utils/draftFilter';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface BlogPost extends CollectionEntry<'blog'> {}

export interface PaginatedBlogData {
  data: BlogPost[];
  start: number;
  end: number;
  total: number;
  currentPage: number;
  size: number;
  lastPage: number;
  url: {
    current: string;
    prev?: string;
    next?: string;
    first?: string;
    last?: string;
  };
}

export interface SEOData {
  pageTitle: string;
  description: string;
  ogimage: {
    url: string;
    alt: string;
  };
  canonicalUrl: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  prevUrl?: string;
  nextUrl?: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteTitle?: string;
  siteDescription: string;
  siteUrl: string;
  author: string;
  email: string;
  logo?: string;
  imageDomain?: string;
  defaultOgImage: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    discord?: string;
    reddit?: string;
    mastodon?: string;
  };
  contact?: {
    email?: string;
    alias?: string;
  };
  disclaimer?: {
    enabled: boolean;
    text?: string;
  };
}

// ==========================================
// CORE CONTENT FUNCTIONS
// ==========================================

/**
 * Get all blog posts with draft filtering
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const allPosts = await getCollection('blog', filterDrafts);
  return allPosts.sort((a, b) => 
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/**
 * Get only published posts (for RSS, sitemaps)
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const publishedPosts = await getCollection('blog', filterPublishedOnly);
  return publishedPosts.sort((a, b) => 
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/**
 * Get site settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const allSettings = await getCollection('settings');
  const settingsData = allSettings[0]?.data;
  
  if (!settingsData) {
    return {
      siteName: 'Blog',
      siteDescription: 'A blog built with Astro',
      siteUrl: 'https://example.com',
      author: 'Author',
      email: 'author@example.com',
      defaultOgImage: '/og-image.jpg'
    };
  }
  
  // Ensure required properties are present with fallbacks
  return {
    siteName: settingsData.siteName || 'Blog',
    siteDescription: settingsData.siteDescription || 'A blog built with Astro',
    siteUrl: settingsData.siteUrl || 'https://example.com',
    author: settingsData.author || 'Author',
    email: settingsData.email || 'author@example.com',
    defaultOgImage: settingsData.defaultOgImage || '/og-image.jpg',
    // Optional properties can be passed through as-is
    id: settingsData.id,
    siteTitle: settingsData.siteTitle,
    logo: settingsData.logo,
    imageDomain: settingsData.imageDomain,
    social: settingsData.social,
    contact: settingsData.contact,
    disclaimer: settingsData.disclaimer ? {
      enabled: settingsData.disclaimer.enabled ?? false,
      text: settingsData.disclaimer.text,
    } : undefined,
  };
}

/**
 * Get page data by ID
 */
export async function getPageData(pageId: string) {
  try {
    const allPages = await getCollection('pages');
    const pageData = allPages.find(p => p.data.id === pageId)?.data;
    return pageData; // Return undefined if not found
  } catch (error) {
    console.error(`Error getting page data for ${pageId}:`, error);
    throw error;
  }
}

/**
 * Get only published pages from the pages collection
 */
export async function getPublishedPages() {
  return await getCollection('pages', (entry) => entry.data.published === true);
}

/**
 * Check if a page should be indexed based on pages.json settings
 */
export async function shouldIndexPage(pageSlug: string): Promise<boolean> {
  const allPages = await getCollection('pages');
  const pageData = allPages.find(p => p.data.slug === pageSlug);
  
  // If page not found in pages.json, default to index (true)
  if (!pageData) return true;
  
  // Return opposite of noindex (if noindex is true, should not index)
  return !pageData.data.noindex;
}

// ==========================================
// PAGINATION LOGIC
// ==========================================

/**
 * Create pagination data for blog posts
 */
export function createPaginationData(
  posts: BlogPost[], 
  currentPage: number, 
  pageSize: number = 5,
  basePath: string = '/blog'
): PaginatedBlogData {
  const total = posts.length;
  const lastPage = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize - 1, total - 1);
  const data = posts.slice(start, start + pageSize);

  // Generate URLs
  const firstUrl = basePath;
  const lastUrl = lastPage > 1 ? `${basePath}/${lastPage}` : basePath;
  const currentUrl = currentPage === 1 ? basePath : `${basePath}/${currentPage}`;
  const prevUrl = currentPage > 1 ? 
    (currentPage === 2 ? basePath : `${basePath}/${currentPage - 1}`) : 
    undefined;
  const nextUrl = currentPage < lastPage ? `${basePath}/${currentPage + 1}` : undefined;

  return {
    data,
    start,
    end,
    total,
    currentPage,
    size: pageSize,
    lastPage,
    url: {
      current: currentUrl,
      prev: prevUrl,
      next: nextUrl,
      first: firstUrl,
      last: lastUrl
    }
  };
}

/**
 * Generate static paths for paginated blog
 */
export async function generateBlogPaginationPaths(pageSize: number = 5) {
  const posts = await getAllPosts();
  const totalPages = Math.ceil(posts.length / pageSize);
  
  const paths = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const paginationData = createPaginationData(posts, i, pageSize);
    paths.push({
      params: { page: i.toString() },
      props: { page: paginationData }
    });
  }
  
  return paths;
}

// ==========================================
// CATEGORY LOGIC
// ==========================================

/**
 * Get posts by category
 */
export async function getPostsByCategory(categoryId: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => {
    const postCategoryId = typeof post.data.category === 'string' ? 
      post.data.category : post.data.category?.id;
    return postCategoryId === categoryId;
  });
}

/**
 * Get all categories with post counts
 */
export async function getCategoriesWithPostCounts() {
  const allPosts = await getAllPosts();
  const allCategories = await getCollection('categories');
  
  return allCategories.map(category => {
    const postCount = allPosts.filter(post => {
      const postCategoryId = typeof post.data.category === 'string' ? 
        post.data.category : post.data.category?.id;
      return postCategoryId === category.id;
    }).length;
    
    return {
      ...category,
      postCount
    };
  }).filter(category => category.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount);
}

/**
 * Generate static paths for category pages
 */
export async function generateCategoryPaths() {
  const allPosts = await getAllPosts();
  
  // Load all categories to ensure we create pages for empty ones too
  const allCategories = await getCollection('categories');
  
  return allCategories.map(category => {
    const filteredPosts = allPosts.filter(post => {
      const postCategoryId = typeof post.data.category === 'string' ? 
        post.data.category : post.data.category?.id;
      return postCategoryId === category.data.id;
    });
    
    return {
      params: { category: category.data.slug },
      props: { 
        posts: filteredPosts,
        categoryId: category.data.id
      },
    };
  });
}

// ==========================================
// TAG LOGIC
// ==========================================

/**
 * Get posts by tag
 */
export async function getPostsByTag(tagId: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post =>
    post.data.tags.some(tagRef => {
      const tagRefId = typeof tagRef === 'string' ? tagRef : tagRef.id;
      return tagRefId === tagId;
    })
  );
}

/**
 * Get all tags with post counts
 */
export async function getTagsWithPostCounts() {
  const allPosts = await getAllPosts();
  const allTags = await getCollection('tags');
  
  return allTags.map(tag => {
    const postCount = allPosts.filter(post => 
      post.data.tags.some(tagRef => {
        const tagRefId = typeof tagRef === 'string' ? tagRef : tagRef.id;
        return tagRefId === tag.id;
      })
    ).length;
    
    return {
      ...tag,
      postCount
    };
  }).sort((a, b) => b.postCount - a.postCount);
}

/**
 * Generate static paths for tag pages
 */
export async function generateTagPaths() {
  const allPosts = await getAllPosts();
  
  // Load all tags to ensure we create pages for empty ones too
  const allTags = await getCollection('tags');
  
  return allTags.map(tag => {
    const filteredPosts = allPosts.filter(post =>
      post.data.tags.some(tagRef => {
        const tagRefId = typeof tagRef === 'string' ? tagRef : tagRef.id;
        return tagRefId === tag.data.id;
      })
    );
    
    return {
      params: { tag: tag.data.slug },
      props: { 
        posts: filteredPosts,
        tagId: tag.data.id
      },
    };
  });
}

// ==========================================
// AUTHOR LOGIC
// ==========================================

/**
 * Get posts by author ID (for backward compatibility)
 */
export async function getPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => {
    const postAuthorId = typeof post.data.author === 'string' ? 
      post.data.author : post.data.author?.id;
    return postAuthorId === authorId;
  });
}

/**
 * Get posts by author slug
 */
export async function getPostsByAuthorSlug(authorSlug: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const allAuthors = await getCollection('authors');
  
  // Find the author by slug
  const author = allAuthors.find(a => a.data.slug === authorSlug);
  if (!author) return [];
  
  // Get posts by author ID
  return allPosts.filter(post => {
    const postAuthorId = typeof post.data.author === 'string' ? 
      post.data.author : post.data.author?.id;
    return postAuthorId === author.id;
  });
}

/**
 * Get all authors with post counts
 */
export async function getAuthorsWithPostCounts() {
  const allPosts = await getAllPosts();
  const allAuthors = await getCollection('authors');
  
  return allAuthors.map(author => {
    const postCount = allPosts.filter(post => {
      const postAuthorId = typeof post.data.author === 'string' ? 
        post.data.author : post.data.author?.id;
      return postAuthorId === author.id;
    }).length;
    
    return {
      ...author,
      postCount
    };
  }).sort((a, b) => b.postCount - a.postCount);
}

/**
 * Generate static paths for author pages
 */
export async function generateAuthorPaths() {
  const authors = await getCollection('authors');
  
  return authors.map((author) => ({
    params: { slug: author.data.slug },
    props: { author },
  }));
}

/**
 * Get unique tags from author's posts (by author ID)
 */
export async function getAuthorTags(authorId: string): Promise<string[]> {
  const authorPosts = await getPostsByAuthor(authorId);
  const tagIds = authorPosts.flatMap(post => 
    post.data.tags?.map(tagRef => {
      const tagRefId = typeof tagRef === 'string' ? tagRef : tagRef.id;
      return tagRefId;
    }) || []
  );
  return Array.from(new Set(tagIds));
}

/**
 * Get unique tags from author's posts (by author slug)
 */
export async function getAuthorTagsBySlug(authorSlug: string): Promise<string[]> {
  const authorPosts = await getPostsByAuthorSlug(authorSlug);
  const tagIds = authorPosts.flatMap(post => 
    post.data.tags?.map(tagRef => {
      const tagRefId = typeof tagRef === 'string' ? tagRef : tagRef.id;
      return tagRefId;
    }) || []
  );
  return Array.from(new Set(tagIds));
}

// ==========================================
// SEO GENERATION
// ==========================================

/**
 * Generate SEO data for blog listing page
 */
export async function generateBlogListingSEO(
  currentPage: number = 1,
  totalPages: number = 1
): Promise<SEOData> {
  const settings = await getSiteSettings();
  const pageData = await getPageData('all-posts');
  
  const pageTitle = currentPage === 1 
    ? pageData?.seo?.title || `All Posts - ${settings.siteName}`
    : `All Posts - Page ${currentPage} - ${settings.siteName}`;

  const description = currentPage === 1
    ? pageData?.seo?.description || `Browse all blog posts from ${settings.siteName}.`
    : `Browse blog posts from ${settings.siteName} - Page ${currentPage} of ${totalPages}.`;

  const ogimage = {
    url: pageData?.seo?.ogImage || settings.defaultOgImage || "/og-image.jpg",
    alt: `${settings.siteName} - All Posts${currentPage > 1 ? ` - Page ${currentPage}` : ''}`,
  };

  const canonicalUrl = `${settings.siteUrl}/blog${currentPage > 1 ? `/${currentPage}` : ''}`;
  
  const prevUrl = currentPage > 1 ? 
    `${settings.siteUrl}${currentPage === 2 ? '/blog' : `/blog/${currentPage - 1}`}` : 
    undefined;
  
  const nextUrl = currentPage < totalPages ? 
    `${settings.siteUrl}/blog/${currentPage + 1}` : 
    undefined;

  return {
    pageTitle,
    description,
    ogimage,
    canonicalUrl,
    prevUrl,
    nextUrl
  };
}

/**
 * Generate SEO data for category page
 */
export async function generateCategorySEO(categorySlug: string): Promise<SEOData> {
  try {
    const settings = await getSiteSettings();
    const allCategories = await getCollection('categories');
    const categoryData = allCategories.find(cat => cat.data.slug === categorySlug);
    
    const categoryName = categoryData ? categoryData.data.name : categorySlug;
    const categoryDescription = categoryData ? categoryData.data.description : null;

    // Use custom SEO if available, otherwise fallback to generated SEO
    if (categoryData?.data.seo) {
      const customSEO = categoryData.data.seo;
      return {
        pageTitle: customSEO.title || `${categoryName} Posts - ${settings.siteName}`,
        description: customSEO.description || categoryDescription || 
          `Browse all posts in the ${categoryName} category from ${settings.siteName}.`,
        ogimage: {
          url: customSEO.ogImage || settings.defaultOgImage || "/og-image.jpg",
          alt: customSEO.ogImageAlt || `${settings.siteName} - ${categoryName} Posts`,
        },
        canonicalUrl: `${settings.siteUrl}/categories/${categorySlug}`,
        keywords: customSEO.keywords,
        ogImage: customSEO.ogImage,
        ogImageAlt: customSEO.ogImageAlt,
      };
    }

    // Fallback to default SEO generation
    const pageTitle = `${categoryName} Posts - ${settings.siteName}`;
    const description = categoryDescription || 
      `Browse all posts in the ${categoryName} category from ${settings.siteName}.`;

    const ogimage = {
      url: settings.defaultOgImage || "/og-image.jpg",
      alt: `${settings.siteName} - ${categoryName} Posts`,
    };

    const canonicalUrl = `${settings.siteUrl}/categories/${categorySlug}`;

    return {
      pageTitle,
      description,
      ogimage,
      canonicalUrl,
    };
  } catch (error) {
    console.error(`Error generating category SEO for ${categorySlug}:`, error);
    
    // Return minimal fallback SEO
    return {
      pageTitle: `${categorySlug} Posts - Website`,
      description: `Browse all posts in the ${categorySlug} category.`,
      ogimage: {
        url: "/og-image.jpg",
        alt: `${categorySlug} Posts`,
      },
      canonicalUrl: `/categories/${categorySlug}`,
    };
  }
}

/**
 * Generate SEO data for tag page
 */
export async function generateTagSEO(tagSlug: string): Promise<SEOData> {
  try {
    const settings = await getSiteSettings();
    const allTags = await getCollection('tags');
    const tagData = allTags.find(tag => tag.data.slug === tagSlug);
    
    const tagName = tagData ? tagData.data.name : tagSlug;
    const tagDescription = tagData ? tagData.data.description : null;

    // Use custom SEO if available, otherwise fallback to generated SEO
    if (tagData?.data.seo) {
      const customSEO = tagData.data.seo;
      return {
        pageTitle: customSEO.title || `Posts tagged with: ${tagName} - ${settings.siteName}`,
        description: customSEO.description || tagDescription || 
          `Browse all posts tagged with ${tagName} from ${settings.siteName}.`,
        ogimage: {
          url: customSEO.ogImage || settings.defaultOgImage || "/og-image.jpg",
          alt: customSEO.ogImageAlt || `${settings.siteName} - Posts tagged with ${tagName}`,
        },
        canonicalUrl: `${settings.siteUrl}/tags/${tagSlug}`,
        keywords: customSEO.keywords,
        ogImage: customSEO.ogImage,
        ogImageAlt: customSEO.ogImageAlt,
      };
    }

    // Fallback to default SEO generation
    const pageTitle = `Posts tagged with: ${tagName} - ${settings.siteName}`;
    const description = tagDescription || 
      `Browse all posts tagged with ${tagName} from ${settings.siteName}.`;

    const ogimage = {
      url: settings.defaultOgImage || "/og-image.jpg",
      alt: `${settings.siteName} - Posts tagged with ${tagName}`,
    };

    const canonicalUrl = `${settings.siteUrl}/tags/${tagSlug}`;

    return {
      pageTitle,
      description,
      ogimage,
      canonicalUrl,
    };
  } catch (error) {
    console.error(`Error generating tag SEO for ${tagSlug}:`, error);
    
    // Return minimal fallback SEO
    return {
      pageTitle: `${tagSlug} Posts - Website`,
      description: `Browse all posts tagged with ${tagSlug}.`,
      ogimage: {
        url: "/og-image.jpg",
        alt: `${tagSlug} Posts`,
      },
      canonicalUrl: `/tags/${tagSlug}`,
      ogImage: "/og-image.jpg",
      ogImageAlt: `${tagSlug} Posts`,
    };
  }
}

/**
 * Generate SEO data for author page
 */
export async function generateAuthorSEO(author: any): Promise<SEOData> {
  const settings = await getSiteSettings();
  
  const pageTitle = `${author.data.name} - Author`;
  const description = author.data.bio || 
    `Articles by ${author.data.name} on ${settings.siteName}`;

  const ogimage = {
    url: author.data.avatar || settings.defaultOgImage || "/og-image.jpg",
    alt: `${author.data.name} - Author at ${settings.siteName}`,
  };

  const canonicalUrl = `${settings.siteUrl}/authors/${author.data?.slug || author.slug}`;

  return {
    pageTitle,
    description,
    ogimage,
    canonicalUrl
  };
}

/**
 * Generate homepage SEO
 */
export async function generateHomepageSEO(): Promise<SEOData> {
  const settings = await getSiteSettings();
  
  // Use siteTitle if available, otherwise combine siteName with description
  const pageTitle = settings.siteTitle || `${settings.siteName} - ${settings.siteDescription}`;
  const description = settings.siteDescription;

  const ogimage = {
    url: settings.defaultOgImage || "/og-image.jpg",
    alt: `${settings.siteName} - Lightning-fast blog platform built with Astro.`,
  };

  const canonicalUrl = settings.siteUrl;

  return {
    pageTitle,
    description,
    ogimage,
    canonicalUrl
  };
}

// ==========================================
// SCHEMA GENERATION FOR PAGES
// ==========================================

/**
 * Generate structured data for blog listing
 */
export async function generateBlogListingSchema(posts: BlogPost[], currentPage: number = 1) {
  const settings = await getSiteSettings();
  
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `${settings.siteName} Blog`,
    "description": settings.siteDescription,
    "url": `${settings.siteUrl}/blog`,
    "author": {
      "@type": "Person",
      "name": settings.author
    },
    "publisher": {
      "@type": "Organization", 
      "name": settings.siteName,
      "url": settings.siteUrl
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListOrder": "https://schema.org/ItemListOrderDescending",
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": ((currentPage - 1) * 5) + index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.data.title,
          "description": post.data.description,
          "url": `${settings.siteUrl}/blog/${post.id}`,
          "datePublished": post.data.pubDate.toISOString(),
          "author": {
            "@type": "Person",
            "name": settings.author
          },
          "publisher": {
            "@type": "Organization",
            "name": settings.siteName
          }
        }
      }))
    }
  };
}

/**
 * Generate URL for sharing
 */
export function generateShareURL(title: string, author: string, siteName: string): string {
  return encodeURIComponent(`"${title}" - by ${author} | ${siteName}`);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get current URL
 */
export function getCurrentURL(siteUrl: string, pathname: string): string {
  return `${siteUrl}${pathname}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract frontmatter for compatibility
 */
export function extractFrontmatter(post: BlogPost) {
  const authorId = typeof post.data.author === 'string' ? 
    post.data.author : post.data.author?.id;
  const categoryId = typeof post.data.category === 'string' ? 
    post.data.category : post.data.category?.id;
  const tagIds = post.data.tags.map(tag => {
    const tagId = typeof tag === 'string' ? tag : tag.id;
    return tagId;
  });

  return {
    title: post.data.title,
    author: authorId,
    category: categoryId,
    description: post.data.description,
    pubDate: post.data.pubDate,
    image: post.data.image,
    tags: tagIds,
    featured: post.data.featured,
    status: post.data.status,
  };
}

// ==========================================
// ENHANCED UTILITY FUNCTIONS
// ==========================================

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const featuredPosts = allPosts.filter(post => post.data.featured === true);
  return limit ? featuredPosts.slice(0, limit) : featuredPosts;
}

/**
 * Get recent posts
 */
export async function getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, limit);
}

/**
 * Get related posts based on tags and category
 */
export async function getRelatedPosts(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const currentPostTags = currentPost.data.tags.map(tag => 
    typeof tag === 'string' ? tag : tag.id
  );
  const currentPostCategory = typeof currentPost.data.category === 'string' ? 
    currentPost.data.category : currentPost.data.category?.id;

  // Filter out current post and calculate relevance scores
  const relatedPosts = allPosts
    .filter(post => post.id !== currentPost.id)
    .map(post => {
      let score = 0;
      
      // Same category gets higher score
      const postCategory = typeof post.data.category === 'string' ? 
        post.data.category : post.data.category?.id;
      if (postCategory === currentPostCategory) {
        score += 3;
      }
      
      // Shared tags get points
      const postTags = post.data.tags.map(tag => 
        typeof tag === 'string' ? tag : tag.id
      );
      const sharedTags = postTags.filter(tag => currentPostTags.includes(tag));
      score += sharedTags.length;
      
      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  return relatedPosts;
}

/**
 * Search posts by title and content
 */
export async function searchPosts(query: string, limit?: number): Promise<BlogPost[]> {
  if (!query.trim()) return [];
  
  const allPosts = await getAllPosts();
  const searchTerm = query.toLowerCase();
  
  const matchingPosts = allPosts.filter(post => {
    const title = post.data.title.toLowerCase();
    const description = post.data.description?.toLowerCase() || '';
    
    return title.includes(searchTerm) || description.includes(searchTerm);
  });
  
  return limit ? matchingPosts.slice(0, limit) : matchingPosts;
}

/**
 * Get post statistics
 */
export async function getBlogStats() {
  const allPosts = await getAllPosts();
  const allCategories = await getCollection('categories');
  const allTags = await getCollection('tags');
  const allAuthors = await getCollection('authors');
  
  const totalPosts = allPosts.length;
  const featuredPosts = allPosts.filter(post => post.data.featured).length;
  const publishedThisMonth = allPosts.filter(post => {
    const postDate = new Date(post.data.pubDate);
    const now = new Date();
    return postDate.getMonth() === now.getMonth() && 
           postDate.getFullYear() === now.getFullYear();
  }).length;
  
  return {
    totalPosts,
    totalCategories: allCategories.length,
    totalTags: allTags.length,
    totalAuthors: allAuthors.length,
    featuredPosts,
    publishedThisMonth,
    averagePostsPerMonth: Math.round(totalPosts / 12) // Rough estimate
  };
}

/**
 * Get top categories for footer display (excluding uncategorized)
 */
export async function getTopCategories(limit: number = 4): Promise<Array<{id: string, data: any, postCount: number}>> {
  const categoriesWithCounts = await getCategoriesWithPostCounts();
  // Filter out uncategorized categories
  const filteredCategories = categoriesWithCounts.filter(category => 
    category.data.slug !== 'uncategorized' && 
    category.data.name.toLowerCase() !== 'uncategorized' &&
    category.postCount > 0
  );
  return filteredCategories.slice(0, limit);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags and markdown
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*`_~]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}