import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the affiliate product type from your content collection
type AffiliateProduct = CollectionEntry<'affiliateProducts'>;

// Define the API response types (same as main products API)
interface AffiliateProductMetadata {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  affiliateUrl: string;
  image: string;
  imageAlt: string;
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  rating?: number;
  reviewCount?: number;
  brand?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
  badge?: string;
  buttonText?: string;
  featured: boolean;
  discountPercent?: number;
}

interface CategoryProductApiResponse {
  success: boolean;
  data: AffiliateProductMetadata[];
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    productCount: number;
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
    brand: string | null;
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
  const brand: string | null = searchParams.get('brand');

  try {
    console.log(`🛍️ Fetching products for category "${categoryId}"...`);

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

    // ✨ Get ALL affiliate products for this category
    const allProducts: AffiliateProduct[] = await getCollection('affiliateProducts', ({ data }) => {
      // Filter by category during collection
      if (typeof data.category === 'string') {
        return data.category === categoryId;
      } else if (data.category && typeof data.category === 'object') {
        return data.category.id === categoryId;
      }
      return false;
    });

    console.log(`🛍️ Found ${allProducts.length} products in category "${categoryId}"`);

    // 🔍 Server-side search
    let filteredProducts: AffiliateProduct[] = allProducts;

    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredProducts = filteredProducts.filter((product: AffiliateProduct) => {
        const titleMatch = product.data.title?.toLowerCase().includes(searchTerm) || false;
        const descMatch = product.data.description?.toLowerCase().includes(searchTerm) || false;
        const brandMatch = product.data.brand?.toLowerCase().includes(searchTerm) || false;

        return titleMatch || descMatch || brandMatch;
      });
      console.log(`🔍 Search "${search}" filtered to ${filteredProducts.length} products`);
    }

    // 📊 Transform products with metadata
    const productsWithMetadata: AffiliateProductMetadata[] = filteredProducts.map((product: AffiliateProduct) => {
      // Calculate discount percentage
      const discountPercent = product.data.originalPrice && product.data.price
        ? Math.round(
          ((parseFloat(product.data.originalPrice.replace('$', '')) -
            parseFloat(product.data.price.replace('$', ''))) /
            parseFloat(product.data.originalPrice.replace('$', ''))) * 100
        )
        : undefined;

      // Determine if featured (has badge or high rating)
      const featured = !!(product.data.badge || (product.data.rating && product.data.rating >= 4.5));

      return {
        id: product.id,
        title: product.data.title,
        description: product.data.description,
        price: product.data.price,
        originalPrice: product.data.originalPrice,
        affiliateUrl: product.data.affiliateUrl,
        image: product.data.image,
        imageAlt: product.data.imageAlt,
        category: {
          id: categoryData.id,
          name: categoryData.data.name,
          description: categoryData.data.description,
          color: categoryData.data.color,
        },
        rating: product.data.rating,
        reviewCount: product.data.reviewCount,
        brand: product.data.brand,
        features: product.data.features,
        pros: product.data.pros,
        cons: product.data.cons,
        badge: product.data.badge,
        buttonText: product.data.buttonText,
        featured,
        discountPercent,
      };
    });

    // 🔍 Apply filters
    let finalProducts = productsWithMetadata;

    // Filter by active status - since we removed the active field, all products are considered active
    if (active !== null) {
      const isActive = active === 'true';
      if (!isActive) {
        // If filtering for inactive products, return empty array since all are active now
        finalProducts = [];
      }
      console.log(`✨ Filtered to ${finalProducts.length} ${isActive ? 'active' : 'inactive'} products`);
    }

    // Filter by featured
    if (featured !== null) {
      const isFeatured = featured === 'true';
      finalProducts = finalProducts.filter(product => product.featured === isFeatured);
      console.log(`⭐ Filtered to ${finalProducts.length} ${isFeatured ? 'featured' : 'non-featured'} products`);
    }

    // Filter by brand
    if (brand) {
      finalProducts = finalProducts.filter(product =>
        product.brand?.toLowerCase() === brand.toLowerCase()
      );
      console.log(`🏷️ Filtered to ${finalProducts.length} products from brand "${brand}"`);
    }

    // 📐 Sort products
    finalProducts.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          const priceA = parseFloat(a.price.replace('$', ''));
          const priceB = parseFloat(b.price.replace('$', ''));
          comparison = priceA - priceB;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'dateAdded':
          // Since dateAdded field was removed, sort by title as fallback
          comparison = a.title.localeCompare(b.title);
          break;
        case 'brand':
          comparison = (a.brand || '').localeCompare(b.brand || '');
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 📄 Paginate
    const startIndex: number = (page - 1) * perPage;
    const endIndex: number = startIndex + perPage;
    const paginatedProducts: AffiliateProductMetadata[] = finalProducts.slice(startIndex, endIndex);

    const apiResponse: CategoryProductApiResponse = {
      success: true,
      data: paginatedProducts,
      category: {
        id: categoryData.id,
        name: categoryData.data.name,
        description: categoryData.data.description,
        color: categoryData.data.color,
        productCount: finalProducts.length,
      },
      pagination: {
        page,
        perPage,
        total: finalProducts.length,
        totalPages: Math.ceil(finalProducts.length / perPage),
        hasNext: endIndex < finalProducts.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        active: active,
        featured: featured,
        brand: brand,
      },
      timestamp: Date.now(),
    };

    console.log(`✅ Returning ${paginatedProducts.length} products for category "${categoryId}" (page ${page} of ${Math.ceil(finalProducts.length / perPage)})`);

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    console.error(`❌ Error fetching products for category "${categoryId}":`, error);

    return new Response(JSON.stringify({
      success: false,
      error: `Failed to fetch products for category "${categoryId}"`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;