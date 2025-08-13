import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the affiliate comparison type from your content collection
type AffiliateComparison = CollectionEntry<'affiliateComparisons'>;

// Define the API response types
interface AffiliateComparisonMetadata {
  id: string;
  title: string;
  description?: string;
  products: {
    id: string;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    affiliateUrl: string;
    image: string;
    imageAlt: string;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    features?: string[];
    pros?: string[];
    cons?: string[];
    badge?: string;
    buttonText?: string;
    discountPercent?: number;
  }[];
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  active: boolean;
  productCount: number;
}

interface CategoryComparisonApiResponse {
  success: boolean;
  data: AffiliateComparisonMetadata[];
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    comparisonCount: number;
  };
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
  'Access-Control-Max-Age': '86400',
});

// 🔥 Handle OPTIONS requests for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: getCORSHeaders()
  });
};

export const GET: APIRoute = async ({ request, url, params }): Promise<Response> => {
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

  // Get category from URL params
  const categoryId = params.category;
  
  if (!categoryId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Category parameter is required',
      code: 'MISSING_CATEGORY'
    }), {
      status: 400,
      headers: getCORSHeaders()
    });
  }

  // Get query parameters
  const searchParams = new URL(url).searchParams;
  const page: number = parseInt(searchParams.get('page') || '1');
  const perPage: number = parseInt(searchParams.get('perPage') || '50');
  const sortBy: string = searchParams.get('sortBy') || 'title';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const search: string = searchParams.get('search') || '';
  const active: string | null = searchParams.get('active');
  const featured: string | null = searchParams.get('featured');
  try {
    console.log(`🔍 Fetching comparisons for category "${categoryId}"...`);
    
    // ✨ Verify category exists
    const categoryData = await getEntry('affiliateCategories', categoryId);
    
    if (!categoryData) {
      return new Response(JSON.stringify({
        success: false,
        error: `Category "${categoryId}" not found`,
        code: 'CATEGORY_NOT_FOUND'
      }), {
        status: 404,
        headers: getCORSHeaders()
      });
    }

    // ✨ Get ALL affiliate comparisons for this category
    const allComparisons: AffiliateComparison[] = await getCollection('affiliateComparisons', ({ data }) => {
      // Filter by category during collection
      if (typeof data.category === 'string') {
        return data.category === categoryId;
      } else if (data.category && typeof data.category === 'object') {
        return data.category.id === categoryId;
      }
      return false;
    });
    
    console.log(`🔍 Found ${allComparisons.length} comparisons in category "${categoryId}"`);

    // 🔍 Server-side search
    let filteredComparisons: AffiliateComparison[] = allComparisons;
    
    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredComparisons = filteredComparisons.filter((comparison: AffiliateComparison) => {
        const titleMatch = comparison.data.title?.toLowerCase().includes(searchTerm) || false;
        const descMatch = comparison.data.description?.toLowerCase().includes(searchTerm) || false;
        
        return titleMatch || descMatch;
      });
      console.log(`🔍 Search "${search}" filtered to ${filteredComparisons.length} comparisons`);
    }

    // 📊 Transform comparisons with metadata and resolve product references
    const comparisonsWithMetadata: AffiliateComparisonMetadata[] = await Promise.all(
      filteredComparisons.map(async (comparison: AffiliateComparison) => {
        // Resolve product references
        const resolvedProducts = await Promise.all(
          comparison.data.products.map(async (productRef) => {
            try {
              const product = await getEntry('affiliateProducts', productRef.id);
              if (!product) {
                console.warn(`⚠️ Product "${productRef.id}" not found for comparison "${comparison.id}"`);
                return null;
              }

              // Calculate discount percentage
              const discountPercent = product.data.originalPrice && product.data.price
                ? Math.round(
                    ((parseFloat(product.data.originalPrice.replace('$', '')) -
                      parseFloat(product.data.price.replace('$', ''))) /
                      parseFloat(product.data.originalPrice.replace('$', ''))) * 100
                  )
                : undefined;

              return {
                id: product.id,
                title: product.data.title,
                description: product.data.description,
                price: product.data.price,
                originalPrice: product.data.originalPrice,
                affiliateUrl: product.data.affiliateUrl,
                image: product.data.image,
                imageAlt: product.data.imageAlt,
                rating: product.data.rating,
                reviewCount: product.data.reviewCount,
                brand: product.data.brand,
                features: product.data.features,
                pros: product.data.pros,
                cons: product.data.cons,
                badge: product.data.badge,
                buttonText: product.data.buttonText,
                discountPercent,
              };
            } catch (error) {
              console.error(`❌ Error resolving product "${productRef.id}":`, error);
              return null;
            }
          })
        );

        // Filter out null products (failed to resolve)
        const validProducts = resolvedProducts.filter(product => product !== null);

        return {
          id: comparison.id,
          title: comparison.data.title,
          description: comparison.data.description,
          products: validProducts,
          category: {
            id: categoryData.id,
            name: categoryData.data.name,
            description: categoryData.data.description,
            color: categoryData.data.color,
          },
          active: comparison.data.active,
          productCount: validProducts.length,
        };
      })
    );

    // 🔍 Apply filters
    let finalComparisons = comparisonsWithMetadata;

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      finalComparisons = finalComparisons.filter(comparison => comparison.active === isActive);
      console.log(`✨ Filtered to ${finalComparisons.length} ${isActive ? 'active' : 'inactive'} comparisons`);
    }

    // Filter by featured - since we removed the featured field, treat all comparisons as non-featured
    if (featured !== null) {
      const isFeatured = featured === 'true';
      if (isFeatured) {
        // If filtering for featured comparisons, return empty array since none are featured now
        finalComparisons = [];
      }
      console.log(`⭐ Filtered to ${finalComparisons.length} ${isFeatured ? 'featured' : 'non-featured'} comparisons`);
    }

    // 📐 Sort comparisons
    finalComparisons.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dateCreated':
          // Since dateCreated field was removed, sort by title as fallback
          comparison = a.title.localeCompare(b.title);
          break;
        case 'productCount':
          comparison = a.productCount - b.productCount;
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 📄 Paginate
    const startIndex: number = (page - 1) * perPage;
    const endIndex: number = startIndex + perPage;
    const paginatedComparisons: AffiliateComparisonMetadata[] = finalComparisons.slice(startIndex, endIndex);

    const apiResponse: CategoryComparisonApiResponse = {
      success: true,
      data: paginatedComparisons,
      category: {
        id: categoryData.id,
        name: categoryData.data.name,
        description: categoryData.data.description,
        color: categoryData.data.color,
        comparisonCount: finalComparisons.length,
      },
      pagination: {
        page,
        perPage,
        total: finalComparisons.length,
        totalPages: Math.ceil(finalComparisons.length / perPage),
        hasNext: endIndex < finalComparisons.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        active: active,
        featured: featured,
      },
      timestamp: Date.now(),
    };

    console.log(`✅ Returning ${paginatedComparisons.length} comparisons for category "${categoryId}" (page ${page} of ${Math.ceil(finalComparisons.length / perPage)})`);

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    console.error(`❌ Error fetching comparisons for category "${categoryId}":`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Failed to fetch comparisons for category "${categoryId}"`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;