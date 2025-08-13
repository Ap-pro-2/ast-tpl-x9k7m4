import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the tag type from your content collection
type Tag = CollectionEntry<'tags'>;

// Define the SEO type to match our backend schema
interface TagSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
}

// Define the API response type for tags - UPDATED TO MATCH BACKEND
interface TagMetadata {
  id: string;
  name: string;
  description?: string;
  color?: string;
  slug: string;
  seo?: TagSEO; // Added SEO support
  postCount: number;
  lastPostDate?: string;
  trending: boolean;
  category?: string; // Most common category for this tag
}

interface TagApiResponse {
  success: boolean;
  data: TagMetadata[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string | null;
    trending: string | null;
    minPosts: number | null;
  };
  stats: {
    totalTags: number;
    totalPosts: number;
    averagePostsPerTag: number;
    topTags: Array<{ name: string; postCount: number }>;
  };
  timestamp: number;
}

// 🔐 Authentication helper
const authenticateRequest = (request: Request): { success: boolean; error?: string } => {
  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('X-API-Key');
  
  // Check for API key in either Authorization header or X-API-Key header
  const providedKey = authHeader?.replace('Bearer ', '') || apiKey;
  
  if (!providedKey) {
    return { 
      success: false, 
      error: 'Missing API key.' 
    };
  }
  
  if (providedKey !== BLOG_API_KEY) {
    return { 
      success: false, 
      error: 'Invalid API key.' 
    };
  }
  
  return { success: true };
};

// 🔥 CORS headers helper
const getCORSHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
});

// 🔥 Handle OPTIONS requests for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: getCORSHeaders()
  });
};

export const GET: APIRoute = async ({ request, url }): Promise<Response> => {
  // 🔐 Authenticate the request first
  const authResult = authenticateRequest(request);
  
  if (!authResult.success) {
    return new Response(JSON.stringify({
      success: false,
      error: authResult.error,
      code: 'UNAUTHORIZED'
    }), {
      status: 401,
      headers: getCORSHeaders()
    });
  }

  // Get query parameters with proper types
  const searchParams = new URL(url).searchParams;
  const page: number = parseInt(searchParams.get('page') || '1');
  const perPage: number = parseInt(searchParams.get('perPage') || '100');
  const sortBy: string = searchParams.get('sortBy') || 'postCount';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const search: string = searchParams.get('search') || '';
  const trending: string | null = searchParams.get('trending');
  const minPosts: number = parseInt(searchParams.get('minPosts') || '0');

  try {
    console.log('🏷️ Fetching tags from collection...');
    
    // ✨ Get ALL tags with proper typing
    const allTags: Tag[] = await getCollection('tags');
    console.log(`🏷️ Found ${allTags.length} tags in collection`);
    
    // ✨ Get ALL blog posts to calculate post counts per tag
    const allPosts = await getCollection('blog', ({ data }) => {
      // Only count published posts for public API
      return data.status === 'published';
    });
    console.log(`📝 Found ${allPosts.length} published posts`);

    // 🔍 Server-side search with proper typing
    let filteredTags: Tag[] = allTags;
    
    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredTags = filteredTags.filter((tag: Tag) => {
        const nameMatch: boolean = tag.data.name?.toLowerCase().includes(searchTerm) || false;
        const descMatch: boolean = tag.data.description?.toLowerCase().includes(searchTerm) || false;
        const idMatch: boolean = tag.id?.toLowerCase().includes(searchTerm) || false;
        
        return nameMatch || descMatch || idMatch;
      });
      console.log(`🔍 Search "${search}" filtered to ${filteredTags.length} tags`);
    }

    // 📊 Transform tags with metadata and post counts - UPDATED WITH SEO
    const tagsWithMetadata: TagMetadata[] = filteredTags.map((tag: Tag) => {
      // Calculate post count for this tag - IMPROVED HANDLING
      const tagPosts = allPosts.filter(post => {
        if (!post.data.tags || !Array.isArray(post.data.tags)) return false;
        
        // Handle both string references and object references
        return post.data.tags.some(tagRef => {
          if (typeof tagRef === 'string') {
            return tagRef === tag.id;
          } else if (tagRef && typeof tagRef === 'object' && 'id' in tagRef) {
            return tagRef.id === tag.id;
          }
          return false;
        });
      });
      
      const postCount = tagPosts.length;
      console.log(`🏷️ Tag "${tag.data.name}" has ${postCount} posts`);
      
      // Find the most recent post date for this tag
      const lastPostDate = tagPosts.length > 0 
        ? Math.max(...tagPosts.map(p => new Date(p.data.pubDate).getTime()))
        : null;
      
      // Find most common category for this tag - IMPROVED HANDLING
      const categoryFrequency: Record<string, number> = {};
      tagPosts.forEach(post => {
        let categoryId: string | undefined;
        
        if (typeof post.data.category === 'string') {
          categoryId = post.data.category;
        } else if (post.data.category && typeof post.data.category === 'object' && 'id' in post.data.category) {
          categoryId = post.data.category.id;
        }
        
        if (categoryId) {
          categoryFrequency[categoryId] = (categoryFrequency[categoryId] || 0) + 1;
        }
      });
      
      const mostCommonCategory = Object.keys(categoryFrequency).length > 0
        ? Object.keys(categoryFrequency).reduce((a, b) => 
            categoryFrequency[a] > categoryFrequency[b] ? a : b
          )
        : undefined;

      // Calculate if trending (posts in last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentPosts = tagPosts.filter(post => 
        new Date(post.data.pubDate).getTime() > thirtyDaysAgo
      );
      const trending = recentPosts.length >= 2; // At least 2 posts in last 30 days

      // Extract SEO data from tag - FIXED TO MATCH SCHEMA
      const seoData: TagSEO | undefined = tag.data.seo ? {
        title: tag.data.seo.title,
        description: tag.data.seo.description,
        keywords: tag.data.seo.keywords,
        ogImage: tag.data.seo.ogImage,
        ogImageAlt: tag.data.seo.ogImageAlt,
      } : undefined;

      return {
        id: tag.id,
        name: tag.data.name || tag.id,
        description: tag.data.description,
        color: tag.data.color,
        slug: tag.data.slug || tag.id,
        seo: seoData, // Include SEO data
        postCount,
        lastPostDate: lastPostDate ? new Date(lastPostDate).toISOString() : undefined,
        trending,
        category: mostCommonCategory,
      };
    });

    // 🔍 Apply filters
    let finalTags = tagsWithMetadata;

    // Filter by minimum posts
    if (minPosts > 0) {
      finalTags = finalTags.filter(tag => tag.postCount >= minPosts);
      console.log(`📊 Filtered to ${finalTags.length} tags with at least ${minPosts} posts`);
    }

    // Filter by trending
    if (trending !== null) {
      const isTrending = trending === 'true';
      finalTags = finalTags.filter(tag => tag.trending === isTrending);
      console.log(`🔥 Filtered to ${finalTags.length} ${isTrending ? 'trending' : 'non-trending'} tags`);
    }

    // 📐 Sort tags
    finalTags.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'postCount':
          comparison = a.postCount - b.postCount;
          break;
        case 'lastPostDate':
          const dateA = a.lastPostDate ? new Date(a.lastPostDate).getTime() : 0;
          const dateB = b.lastPostDate ? new Date(b.lastPostDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        default:
          comparison = a.postCount - b.postCount;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 📄 Paginate
    const startIndex: number = (page - 1) * perPage;
    const endIndex: number = startIndex + perPage;
    const paginatedTags: TagMetadata[] = finalTags.slice(startIndex, endIndex);

    // 📊 Calculate stats
    const totalPosts = allPosts.length;
    const totalTags = finalTags.length;
    const averagePostsPerTag = totalTags > 0 ? Math.round(totalPosts / totalTags * 100) / 100 : 0;
    const topTags = finalTags
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5)
      .map(tag => ({ name: tag.name, postCount: tag.postCount }));

    const apiResponse: TagApiResponse = {
      success: true,
      data: paginatedTags,
      pagination: {
        page,
        perPage,
        total: finalTags.length,
        totalPages: Math.ceil(finalTags.length / perPage),
        hasNext: endIndex < finalTags.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        trending: trending,
        minPosts: minPosts > 0 ? minPosts : null,
      },
      stats: {
        totalTags,
        totalPosts,
        averagePostsPerTag,
        topTags,
      },
      timestamp: Date.now(),
    };

    console.log(`✅ Returning ${paginatedTags.length} tags (page ${page} of ${Math.ceil(finalTags.length / perPage)})`);

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    console.error('❌ Error fetching tags:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;