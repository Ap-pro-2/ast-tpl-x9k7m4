import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the page type
type Page = CollectionEntry<'pages'>;

// Define the SEO type
interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

// Define the API response type for pages
interface PageMetadata {
  id: string;
  title: string;
  slug: string;
  description?: string;
  published: boolean;
  noindex: boolean;
  seo?: PageSEO;
  type: 'page' | 'legal';
}

interface PageApiResponse {
  success: boolean;
  data: PageMetadata[];
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
    published: string | null;
    noindex: string | null;
    type: string | null;
  };
  timestamp: number;
}

// Authentication helper
const authenticateRequest = (request: Request): { success: boolean; error?: string } => {
  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('X-API-Key');
  
  const providedKey = authHeader?.replace('Bearer ', '') || apiKey;
  
  if (!providedKey) {
    return { success: false, error: 'Missing API key.' };
  }
  
  if (providedKey !== BLOG_API_KEY) {
    return { success: false, error: 'Invalid API key.' };
  }
  
  return { success: true };
};

// CORS headers helper
const getCORSHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
  'Access-Control-Max-Age': '86400',
});

// Handle OPTIONS requests for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: getCORSHeaders()
  });
};

export const GET: APIRoute = async ({ request, url }): Promise<Response> => {
  // Authenticate the request
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

  // Get query parameters
  const searchParams = new URL(url).searchParams;
  const page: number = parseInt(searchParams.get('page') || '1');
  const perPage: number = parseInt(searchParams.get('perPage') || '50');
  const sortBy: string = searchParams.get('sortBy') || 'title';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const search: string = searchParams.get('search') || '';
  const published: string | null = searchParams.get('published');
  const noindex: string | null = searchParams.get('noindex');
  const type: string | null = searchParams.get('type');

  try {
    // Get all pages (includes legal pages from pages.json)
    const allPages: Page[] = await getCollection('pages');

    // Transform all pages with metadata
    let allPagesWithMetadata: PageMetadata[] = allPages.map((page: Page) => {
      const seoData: PageSEO | undefined = page.data.seo ? {
        title: page.data.seo.title,
        description: page.data.seo.description,
        keywords: page.data.seo.keywords,
        ogImage: page.data.seo.ogImage,
        canonical: page.data.seo.canonical,
      } : undefined;

      // Determine if this is a legal page based on ID
      const isLegalPage = page.id.includes('privacy') || page.id.includes('terms');

      return {
        id: page.id,
        title: page.data.title,
        slug: page.data.slug,
        description: page.data.description,
        published: page.data.published,
        noindex: page.data.noindex,
        seo: seoData,
        type: isLegalPage ? 'legal' as const : 'page' as const,
      };
    });

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      allPagesWithMetadata = allPagesWithMetadata.filter((page) => {
        return page.title.toLowerCase().includes(searchTerm) ||
               page.description?.toLowerCase().includes(searchTerm) ||
               page.id.toLowerCase().includes(searchTerm) ||
               page.slug.toLowerCase().includes(searchTerm);
      });
    }

    // Apply filters
    if (published !== null) {
      const isPublished = published === 'true';
      allPagesWithMetadata = allPagesWithMetadata.filter(page => page.published === isPublished);
    }

    if (noindex !== null) {
      const isNoindex = noindex === 'true';
      allPagesWithMetadata = allPagesWithMetadata.filter(page => page.noindex === isNoindex);
    }

    if (type !== null) {
      allPagesWithMetadata = allPagesWithMetadata.filter(page => page.type === type);
    }

    // Sort pages
    allPagesWithMetadata.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'slug':
          comparison = a.slug.localeCompare(b.slug);
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;

        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Paginate
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPages = allPagesWithMetadata.slice(startIndex, endIndex);

    const apiResponse: PageApiResponse = {
      success: true,
      data: paginatedPages,
      pagination: {
        page,
        perPage,
        total: allPagesWithMetadata.length,
        totalPages: Math.ceil(allPagesWithMetadata.length / perPage),
        hasNext: endIndex < allPagesWithMetadata.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        published: published,
        noindex: noindex,
        type: type,
      },
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    console.error('Error fetching pages:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch pages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

export const prerender = false;