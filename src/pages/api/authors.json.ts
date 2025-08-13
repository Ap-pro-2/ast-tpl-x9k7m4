import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the author type from your content collection
type Author = CollectionEntry<'authors'>;

// Define the API response type for authors
interface AuthorMetadata {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  email?: string;
  twitter?: string;
  github?: string;
  website?: string;
  postCount: number;
  lastPostDate?: string;
  featured: boolean;
  topCategories: Array<{ name: string; postCount: number }>;
  topTags: Array<{ name: string; postCount: number }>;
}

interface AuthorApiResponse {
  success: boolean;
  data: AuthorMetadata[];
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
    minPosts: number | null;
  };
  stats: {
    totalAuthors: number;
    totalPosts: number;
    averagePostsPerAuthor: number;
    topAuthors: Array<{ name: string; postCount: number }>;
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
  const sortBy: string = searchParams.get('sortBy') || 'postCount';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const search: string = searchParams.get('search') || '';
  const featured: string | null = searchParams.get('featured');
  const minPosts: number = parseInt(searchParams.get('minPosts') || '0');

  try {
    // ✨ Get ALL authors with proper typing
    const allAuthors: Author[] = await getCollection('authors');

    // ✨ Get ALL blog posts to calculate post counts per author
    const allPosts = await getCollection('blog', ({ data }) => {
      // Only count published posts for public API
      return data.status === 'published';
    });

    // ✨ Get categories and tags for additional metadata
    const allCategories = await getCollection('categories');
    const allTags = await getCollection('tags');

    console.log(`👤 Processing ${allAuthors.length} authors and ${allPosts.length} published posts`);

    // 🔍 Server-side search with proper typing
    let filteredAuthors: Author[] = allAuthors;

    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredAuthors = filteredAuthors.filter((author: Author) => {
        const nameMatch: boolean = author.data.name?.toLowerCase().includes(searchTerm) || false;
        const bioMatch: boolean = author.data.bio?.toLowerCase().includes(searchTerm) || false;
        const idMatch: boolean = author.id?.toLowerCase().includes(searchTerm) || false;
        const emailMatch: boolean = author.data.email?.toLowerCase().includes(searchTerm) || false;

        return nameMatch || bioMatch || idMatch || emailMatch;
      });
      console.log(`🔍 Search "${search}" filtered to ${filteredAuthors.length} authors`);
    }

    // 📊 Transform authors with metadata and post counts
    const authorsWithMetadata: AuthorMetadata[] = filteredAuthors.map((author: Author) => {
      // Calculate post count for this author
      const authorPosts = allPosts.filter(post => post.data.author.id === author.id);
      const postCount = authorPosts.length;

      // Find the most recent post date for this author
      const lastPostDate = authorPosts.length > 0
        ? Math.max(...authorPosts.map(p => new Date(p.data.pubDate).getTime()))
        : null;

      // Calculate top categories for this author
      const categoryFrequency: Record<string, number> = {};
      authorPosts.forEach(post => {
        if (post.data.category && typeof post.data.category === 'object' && post.data.category.id) {
          const catId = post.data.category.id;
          categoryFrequency[catId] = (categoryFrequency[catId] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([catId, count]) => {
          const category = allCategories.find(c => c.id === catId);
          return {
            name: category?.data.name || catId,
            postCount: count
          };
        });

      // Calculate top tags for this author
      const tagFrequency: Record<string, number> = {};
      authorPosts.forEach(post => {
        if (post.data.tags && Array.isArray(post.data.tags)) {
          post.data.tags.forEach(tagRef => {
            if (typeof tagRef === 'object' && tagRef.id) {
              const tagId = tagRef.id;
              tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
            }
          });
        }
      });

      const topTags = Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tagId, count]) => {
          const tag = allTags.find(t => t.id === tagId);
          return {
            name: tag?.data.name || tagId,
            postCount: count
          };
        });

      // Determine if featured (authors with 3+ posts)
      const featured = postCount >= 3;

      return {
        id: author.id,
        name: author.data.name || author.id,
        slug: author.data.slug,
        bio: author.data.bio,
        avatar: author.data.avatar,
        email: author.data.email,
        twitter: author.data.twitter,
        github: author.data.github,
        website: author.data.website,
        postCount,
        lastPostDate: lastPostDate ? new Date(lastPostDate).toISOString() : undefined,
        featured,
        topCategories,
        topTags,
      };
    });

    // 🔍 Apply filters
    let finalAuthors = authorsWithMetadata;

    // Filter by minimum posts
    if (minPosts > 0) {
      finalAuthors = finalAuthors.filter(author => author.postCount >= minPosts);
      console.log(`📊 Filtered to ${finalAuthors.length} authors with at least ${minPosts} posts`);
    }

    // Filter by featured
    if (featured !== null) {
      const isFeatured = featured === 'true';
      finalAuthors = finalAuthors.filter(author => author.featured === isFeatured);
      console.log(`⭐ Filtered to ${finalAuthors.length} ${isFeatured ? 'featured' : 'non-featured'} authors`);
    }

    // 📐 Sort authors
    finalAuthors.sort((a, b) => {
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
    const paginatedAuthors: AuthorMetadata[] = finalAuthors.slice(startIndex, endIndex);

    // 📊 Calculate stats
    const totalPosts = allPosts.length;
    const totalAuthors = finalAuthors.length;
    const averagePostsPerAuthor = totalAuthors > 0 ? Math.round(totalPosts / totalAuthors * 100) / 100 : 0;
    const topAuthors = finalAuthors
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5)
      .map(author => ({ name: author.name, postCount: author.postCount }));

    const apiResponse: AuthorApiResponse = {
      success: true,
      data: paginatedAuthors,
      pagination: {
        page,
        perPage,
        total: finalAuthors.length,
        totalPages: Math.ceil(finalAuthors.length / perPage),
        hasNext: endIndex < finalAuthors.length,
        hasPrev: page > 1,
      },
      filters: {
        search: search || null,
        featured: featured,
        minPosts: minPosts > 0 ? minPosts : null,
      },
      stats: {
        totalAuthors,
        totalPosts,
        averagePostsPerAuthor,
        topAuthors,
      },
      timestamp: Date.now(),
    };

    console.log(`✅ Returning ${paginatedAuthors.length} authors (page ${page} of ${Math.ceil(finalAuthors.length / perPage)})`);

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });

  } catch (error: unknown) {
    console.error('❌ Error fetching authors:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch authors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;