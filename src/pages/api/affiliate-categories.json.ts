import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the affiliate category type from your content collection
type AffiliateCategory = CollectionEntry<'affiliateCategories'>;



// Define the API response type for affiliate categories
interface AffiliateCategoryMetadata {
  id: string;
  name: string;
  description?: string;
  color?: string;
  productCount: number;
  lastUpdated?: string;
  featured: boolean;
}

interface AffiliateCategoryApiResponse {
  success: boolean;
  data: AffiliateCategoryMetadata[];
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
    active: string | null;
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
  const active: string | null = searchParams.get('active');
  const featured: string | null = searchParams.get('featured');

  try {
    
    // ✨ Get ALL affiliate categories with proper typing
    const allCategories: AffiliateCategory[] = await getCollection('affiliateCategories');
    
    // ✨ Get ALL affiliate products to calculate product counts per category
    const allProducts = await getCollection('affiliateProducts');

    // 🔍 Server-side search with proper typing
    let filteredCategories: AffiliateCategory[] = allCategories;
    
    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredCategories = filteredCategories.filter((category: AffiliateCategory) => {
        const nameMatch: boolean = category.data.name?.toLowerCase().includes(searchTerm) || false;
        const descMatch: boolean = category.data.description?.toLowerCase().includes(searchTerm) || false;
        const idMatch: boolean = category.id?.toLowerCase().includes(searchTerm) || false;
        
        return nameMatch || descMatch || idMatch;
      });
    }

    // 📊 Transform categories with metadata and product counts
    const categoriesWithMetadata: AffiliateCategoryMetadata[] = filteredCategories.map((category: AffiliateCategory) => {
      // Calculate product count for this category
      const categoryProducts = allProducts.filter(product => {
        // Handle both string references and object references
        if (typeof product.data.category === 'string') {
          return product.data.category === category.id;
        } else if (product.data.category && typeof product.data.category === 'object') {
          return product.data.category.id === category.id;
        }
        return false;
      });
      
      const productCount = categoryProducts.length;
      
      // Since we removed dateAdded and lastUpdated fields, we'll use current time as fallback
      const lastUpdated = categoryProducts.length > 0 ? Date.now() : null;

      // Determine if featured (categories with 3+ products)
      const featured = productCount >= 3;

      return {
        id: category.id,
        name: category.data.name || category.id,
        description: category.data.description,
        color: category.data.color,
        productCount,
        lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : undefined,
        featured,
      };
    });

    // 🔍 Apply filters
    let finalCategories = categoriesWithMetadata;

    // Filter by active status - since we removed the active field, all categories are considered active
    if (active !== null) {
      const isActive = active === 'true';
      if (!isActive) {
        // If filtering for inactive categories, return empty array since all are active now
        finalCategories = [];
      }
    }

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
        case 'productCount':
          comparison = a.productCount - b.productCount;
          break;
        case 'lastUpdated':
          const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
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
    const paginatedCategories: AffiliateCategoryMetadata[] = finalCategories.slice(startIndex, endIndex);

    const apiResponse: AffiliateCategoryApiResponse = {
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
        active: active,
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
      error: 'Failed to fetch affiliate categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;