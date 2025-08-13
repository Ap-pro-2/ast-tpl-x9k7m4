import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { BLOG_API_KEY } from "astro:env/server";

// Define the blog post type from your content collection
type BlogPost = CollectionEntry<'blog'>;

// Define the API response types
interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    email?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    description?: string;
    color?: string;
    slug: string;
  }>;
  readingTime: number;
  wordCount: number;
  featured: boolean;
  status: string;
  path: string;
  excerpt: string;
  image?: {
    url: string;
    alt: string;
  };
  sha: string;
}

interface ApiResponse {
  success: boolean;
  data: PostMetadata[];
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
    category: string | null;
    tag: string | null;
    featured: string | null;
    status: string | null;
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

  try {
    // Get query parameters with proper types
    const searchParams = new URL(url).searchParams;
    const page: number = parseInt(searchParams.get('page') || '1');
    const perPage: number = parseInt(searchParams.get('perPage') || '10');
    const sortBy: string = searchParams.get('sortBy') || 'date';
    const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const search: string = searchParams.get('search') || '';
    const categoryId: string = searchParams.get('category') || '';
    const tagId: string = searchParams.get('tag') || '';
    const featured: string | null = searchParams.get('featured');
    const status: string = searchParams.get('status') || 'published';

    // ✨ Get all blog posts with proper typing
    const allPosts: BlogPost[] = await getCollection('blog', ({ data }) => {
      // Filter by status - for public API, only show published
      if (status === 'published') {
        return data.status === 'published';
      }
      return true; // For dashboard API, show all
    });

    // 🔍 Server-side filtering with proper typing
    let filteredPosts: BlogPost[] = allPosts;

    // Search filter
    if (search) {
      const searchTerm: string = search.toLowerCase();
      filteredPosts = filteredPosts.filter((post: BlogPost) => {
        const titleMatch: boolean = post.data.title?.toLowerCase().includes(searchTerm) || false;
        const descMatch: boolean = post.data.description?.toLowerCase().includes(searchTerm) || false;
        const bodyMatch: boolean = post.body?.toLowerCase().includes(searchTerm) || false;
        
        return titleMatch || descMatch || bodyMatch;
      });
    }

    // Category filter
    if (categoryId) {
      filteredPosts = filteredPosts.filter((post: BlogPost) => 
        post.data.category.id === categoryId
      );
    }

    // Tag filter
    if (tagId) {
      filteredPosts = filteredPosts.filter((post: BlogPost) => 
        post.data.tags.some(tag => tag.id === tagId)
      );
    }

    // Featured filter
    if (featured !== null) {
      const isFeatured: boolean = featured === 'true';
      filteredPosts = filteredPosts.filter((post: BlogPost) => 
        post.data.featured === isFeatured
      );
    }

    // 📐 Sort posts with proper typing
    filteredPosts.sort((a: BlogPost, b: BlogPost) => {
      let comparison: number = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = (a.data.title || '').localeCompare(b.data.title || '');
          break;
        case 'date':
          comparison = new Date(a.data.pubDate).getTime() - new Date(b.data.pubDate).getTime();
          break;
        default:
          comparison = new Date(a.data.pubDate).getTime() - new Date(b.data.pubDate).getTime();
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // 📄 Paginate with proper typing
    const startIndex: number = (page - 1) * perPage;
    const endIndex: number = startIndex + perPage;
    const paginatedPosts: BlogPost[] = filteredPosts.slice(startIndex, endIndex);
    
    // 📐 Transform posts with metadata and proper typing
    const postsWithMetadata: PostMetadata[] = await Promise.all(
      paginatedPosts.map(async (post: BlogPost): Promise<PostMetadata> => {
        const wordCount: number = post.body?.trim().split(/\s+/).length || 0;
        const readingTime: number = Math.ceil(wordCount / 200);
        
        // ✅ Properly resolve author reference
        let authorData = null;
        try {
          const authorEntry = await getEntry('authors', post.data.author.id);
          authorData = authorEntry?.data;
        } catch (error) {
          console.warn(`Author not found: ${post.data.author.id}`);
        }
        
        // ✅ Properly resolve category reference  
        let categoryData = null;
        try {
          const categoryEntry = await getEntry('categories', post.data.category.id);
          categoryData = categoryEntry?.data;
        } catch (error) {
          console.warn(`Category not found: ${post.data.category.id}`);
        }
        
        // ✅ Properly resolve tags references
        const tagsData = await Promise.all(
          post.data.tags.map(async (tagRef: any) => {
            try {
              const tagEntry = await getEntry('tags', tagRef.id);
              const tagData = tagEntry?.data;
              return {
                id: tagRef.id,
                name: tagData?.name || tagRef.id,
                description: tagData?.description,
                color: tagData?.color,
                slug: tagData?.slug || tagRef.id,
              };
            } catch (error) {
              console.warn(`Tag not found: ${tagRef.id}`);
              return {
                id: tagRef.id,
                name: tagRef.id,
                description: undefined,
                color: undefined,
                slug: tagRef.id,
              };
            }
          })
        );
        
        return {
          slug: post.id,
          title: post.data.title || '',
          date: post.data.pubDate ? 
            new Date(post.data.pubDate).toISOString() : new Date().toISOString(),
          description: post.data.description || '',
          
          // 👤 Properly resolved author reference
          author: {
            id: post.data.author.id,
            name: authorData?.name || 'Unknown',
            bio: authorData?.bio,
            avatar: authorData?.avatar,
            email: authorData?.email,
            twitter: authorData?.twitter,
            github: authorData?.github,
            website: authorData?.website,
          },
          
          // 📂 Properly resolved category reference
          category: {
            id: post.data.category.id,
            name: categoryData?.name || 'Uncategorized',
            description: categoryData?.description,
            color: categoryData?.color,
            slug: categoryData?.slug || post.data.category.id,
          },
          
          // 🏷️ Properly resolved tags references
          tags: tagsData,
          
          // 📊 Metadata
          readingTime,
          wordCount,
          featured: post.data.featured || false,
          status: post.data.status || 'draft',
          path: `src/content/blog/${post.id}`,
          excerpt: post.data.description || (post.body?.substring(0, 160).replace(/[#*`]/g, '').trim() + '...') || '',
          image: post.data.image,
          sha: post.id,
        };
      })
    );
    
    const apiResponse: ApiResponse = {
      success: true,
      data: postsWithMetadata,
      pagination: {
        page,
        perPage,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / perPage),
        hasNext: endIndex < filteredPosts.length,
        hasPrev: page > 1
      },
      filters: {
        search: search || null,
        category: categoryId || null,
        tag: tagId || null,
        featured: featured || null,
        status: status || null,
      },
      timestamp: Date.now()
    };
    
    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: getCORSHeaders()
    });
    
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

// 🔥 Enable SSR for this endpoint
export const prerender = false;