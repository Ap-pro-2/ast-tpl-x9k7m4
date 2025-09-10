import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the category type from your content collection
type Category = CollectionEntry<'categories'>;

// Define the SEO type to match our backend schema
interface CategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
}

// Define the API response type for categories - UPDATED TO MATCH BACKEND
interface CategoryMetadata {
  id: string;
  name: string;
  description?: string;
  color?: string;
  slug: string;
  seo?: CategorySEO; // Added SEO support
  postCount: number;
  lastPostDate?: string;
  featured: boolean;
}

interface CategoryApiResponse {
  success: boolean;
  data: CategoryMetadata[];
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
    featured: string | null;
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
  const perPage: number = parseInt(searchParams.get('perPage') || '50');
  const sortBy: string = searchParams.get('sortBy') || 'name';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const search: string = searchParams.get('search') || '';
  const featured: string | null = searchParams.get('featured');

  try {
    
    // ✨ Get ALL categories with proper typing
    const allCategories: Category[] = await getCollection('categories');
    
    // ✨ Get ALL blog posts to calculate post counts per category
    const allPosts = await getCollection('blog', ({ data }) => {
      // Only count published posts for public API
      return data.status === 'published';
    });

    // 🔍 Server-side search with proper typing
    let filteredCategories: Category[] = allCategories;
    
    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredCategories = filteredCategories.filter((category: Category) => {
        const nameMatch: boolean = category.data.name?.toLowerCase().includes(searchTerm) || false;
        const descMatch: boolean = category.data.description?.toLowerCase().includes(searchTerm) || false;
        const idMatch: boolean = category.id?.toLowerCase().includes(searchTerm) || false;
        
        return nameMatch || descMatch || idMatch;
      });
    }

    // 📊 Transform categories with metadata and post counts - UPDATED WITH SEO
    const categoriesWithMetadata: CategoryMetadata[] = filteredCategories.map((category: Category) => {
      // Calculate post count for this category
      const categoryPosts = allPosts.filter(post => {
        // Handle both string references and object references
        if (typeof post.data.category === 'string') {
          return post.data.category === category.id;
        } else if (post.data.category && typeof post.data.category === 'object') {
          return post.data.category.id === category.id;
        }
        return false;
      });
      
      const postCount = categoryPosts.length;
      
      // Find the most recent post date for this category
      const lastPostDate = categoryPosts.length > 0 
        ? Math.max(...categoryPosts.map(p => new Date(p.data.pubDate).getTime()))
        : null;

      // Determine if featured (categories with 3+ posts)
      const featured = postCount >= 3;

      // Extract SEO data from category - FIXED TO MATCH SCHEMA
      const seoData: CategorySEO | undefined = category.data.seo ? {
        title: category.data.seo.title,
        description: category.data.seo.description,
        keywords: category.data.seo.keywords,
        ogImage: category.data.seo.ogImage,
        ogImageAlt: category.data.seo.ogImageAlt,
      } : undefined;

      return {
        id: category.id,
        name: category.data.name || category.id,
        description: category.data.description,
        color: category.data.color,
        slug: category.data.slug || category.id,
        seo: seoData, // Include SEO data
        postCount,
        lastPostDate: lastPostDate ? new Date(lastPostDate).toISOString() : undefined,
        featured,
      };
    });

    // 🔍 Apply filters
    let finalCategories = categoriesWithMetadata;

    // Filter by featured
    if (featured !== null) {
      const isFeatured = featured === 'true';
      finalCategories = finalCategories.filter(category => category.featured === isFeatured);
    }

    // 📐 Sort categories
    finalCategories.sort((a, b) => {
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
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 📄 Paginate
    const startIndex: number = (page - 1) * perPage;
    const endIndex: number = startIndex + perPage;
    const paginatedCategories: CategoryMetadata[] = finalCategories.slice(startIndex, endIndex);

    const apiResponse: CategoryApiResponse = {
      success: true,
      data: paginatedCategories,
      pagination: {
        page,
        perPage,
        total: finalCategories.length,
        totalPages: Math.ceil(finalCategories.length / perPage),
        hasNext: endIndex < finalCategories.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        featured: featured,
      },
      timestamp: Date.now(),
    };


    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;