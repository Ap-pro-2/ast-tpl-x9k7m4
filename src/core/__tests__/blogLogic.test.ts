// src/core/__tests__/blogLogic.test.ts
// Comprehensive unit tests for core blog logic functions

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import * as blogLogic from '../blogLogic';

// Mock Astro content collections
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

// Mock draft filter utilities
vi.mock('../../utils/draftFilter', () => ({
  filterDrafts: vi.fn((entry) => entry.data.status !== 'draft'),
  filterPublishedOnly: vi.fn((entry) => entry.data.status === 'published'),
}));

// Import mocked functions
import { getCollection } from 'astro:content';
const mockGetCollection = vi.mocked(getCollection);

// Test data fixtures
const mockBlogPosts: CollectionEntry<'blog'>[] = [
  {
    id: 'post-1',
    slug: 'post-1',
    body: 'Content of post 1',
    collection: 'blog',
    data: {
      title: 'First Post',
      description: 'Description of first post',
      pubDate: new Date('2024-01-15'),
      status: 'published',
      author: { id: 'author-1' },
      category: { id: 'tech' },
      tags: [{ id: 'javascript' }, { id: 'web-dev' }],
      image: { url: '/image1.jpg', alt: 'Image 1' },
      featured: true,
    },
  },
  {
    id: 'post-2',
    slug: 'post-2',
    body: 'Content of post 2',
    collection: 'blog',
    data: {
      title: 'Second Post',
      description: 'Description of second post',
      pubDate: new Date('2024-01-10'),
      status: 'published',
      author: { id: 'author-2' },
      category: { id: 'design' },
      tags: [{ id: 'css' }, { id: 'design' }],
      image: { url: '/image2.jpg', alt: 'Image 2' },
      featured: false,
    },
  },
  {
    id: 'post-3',
    slug: 'post-3',
    body: 'Content of post 3',
    collection: 'blog',
    data: {
      title: 'Draft Post',
      description: 'Description of draft post',
      pubDate: new Date('2024-01-20'),
      status: 'draft',
      author: { id: 'author-1' },
      category: { id: 'tech' },
      tags: [{ id: 'javascript' }],
      featured: false,
    },
  },
];

const mockCategories: CollectionEntry<'categories'>[] = [
  {
    id: 'tech',
    slug: 'tech',
    body: '',
    collection: 'categories',
    data: {
      id: 'tech',
      name: 'Technology',
      slug: 'technology',
      description: 'Tech posts',
    },
  },
  {
    id: 'design',
    slug: 'design',
    body: '',
    collection: 'categories',
    data: {
      id: 'design',
      name: 'Design',
      slug: 'design',
      description: 'Design posts',
    },
  },
];

const mockTags: CollectionEntry<'tags'>[] = [
  {
    id: 'javascript',
    slug: 'javascript',
    body: '',
    collection: 'tags',
    data: {
      id: 'javascript',
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript posts',
    },
  },
  {
    id: 'css',
    slug: 'css',
    body: '',
    collection: 'tags',
    data: {
      id: 'css',
      name: 'CSS',
      slug: 'css',
      description: 'CSS posts',
    },
  },
  {
    id: 'web-dev',
    slug: 'web-dev',
    body: '',
    collection: 'tags',
    data: {
      id: 'web-dev',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development posts',
    },
  },
  {
    id: 'design',
    slug: 'design',
    body: '',
    collection: 'tags',
    data: {
      id: 'design',
      name: 'Design',
      slug: 'design',
      description: 'Design posts',
    },
  },
];

const mockAuthors: CollectionEntry<'authors'>[] = [
  {
    id: 'author-1',
    slug: 'author-1',
    body: '',
    collection: 'authors',
    data: {
      name: 'John Doe',
      bio: 'Tech writer',
      avatar: '/avatar1.jpg',
    },
  },
  {
    id: 'author-2',
    slug: 'author-2',
    body: '',
    collection: 'authors',
    data: {
      name: 'Jane Smith',
      bio: 'Design expert',
      avatar: '/avatar2.jpg',
    },
  },
];

const mockSettings: CollectionEntry<'settings'>[] = [
  {
    id: 'site',
    slug: 'site',
    body: '',
    collection: 'settings',
    data: {
      siteName: 'Test Blog',
      siteDescription: 'A test blog',
      siteUrl: 'https://testblog.com',
      author: 'Test Author',
      email: 'test@example.com',
      defaultOgImage: '/og-default.jpg',
    },
  },
];

const mockPages: CollectionEntry<'pages'>[] = [
  {
    id: 'all-posts',
    slug: 'all-posts',
    body: '',
    collection: 'pages',
    data: {
      id: 'all-posts',
      seo: {
        title: 'All Posts - Test Blog',
        description: 'Browse all posts',
        ogImage: '/og-posts.jpg',
      },
    },
  },
];

describe('Core Blog Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // CONTENT FUNCTIONS TESTS
  // ==========================================

  describe('getAllPosts', () => {
    it('should return all posts excluding drafts, sorted by date descending', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getAllPosts();

      expect(mockGetCollection).toHaveBeenCalledWith('blog', expect.any(Function));
      expect(result).toHaveLength(2);
      expect(result[0].data.title).toBe('First Post'); // Newer date first
      expect(result[1].data.title).toBe('Second Post');
    });

    it('should handle empty posts array', async () => {
      mockGetCollection.mockResolvedValue([]);

      const result = await blogLogic.getAllPosts();

      expect(result).toEqual([]);
    });
  });

  describe('getPublishedPosts', () => {
    it('should return only published posts', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getPublishedPosts();

      expect(result).toHaveLength(2);
      expect(result.every(post => post.data.status === 'published')).toBe(true);
    });
  });

  describe('getSiteSettings', () => {
    it('should return site settings from collection', async () => {
      mockGetCollection.mockResolvedValue(mockSettings);

      const result = await blogLogic.getSiteSettings();

      expect(result.siteName).toBe('Test Blog');
      expect(result.siteUrl).toBe('https://testblog.com');
    });

    it('should return default settings when no settings found', async () => {
      mockGetCollection.mockResolvedValue([]);

      const result = await blogLogic.getSiteSettings();

      expect(result.siteName).toBe('Blog');
      expect(result.siteUrl).toBe('https://example.com');
    });
  });

  describe('getPageData', () => {
    it('should return page data by ID', async () => {
      mockGetCollection.mockResolvedValue(mockPages);

      const result = await blogLogic.getPageData('all-posts');

      expect(result?.id).toBe('all-posts');
      expect(result?.seo?.title).toBe('All Posts - Test Blog');
    });

    it('should return undefined for non-existent page', async () => {
      mockGetCollection.mockResolvedValue(mockPages);

      const result = await blogLogic.getPageData('non-existent');

      expect(result).toBeUndefined();
    });
  });

  // ==========================================
  // PAGINATION TESTS
  // ==========================================

  describe('createPaginationData', () => {
    const testPosts = mockBlogPosts.slice(0, 2); // Use 2 posts for testing

    it('should create correct pagination data for first page', () => {
      const result = blogLogic.createPaginationData(testPosts, 1, 1);

      expect(result.currentPage).toBe(1);
      expect(result.total).toBe(2);
      expect(result.lastPage).toBe(2);
      expect(result.data).toHaveLength(1);
      expect(result.url.current).toBe('/blog');
      expect(result.url.prev).toBeUndefined();
      expect(result.url.next).toBe('/blog/2');
    });

    it('should create correct pagination data for middle page', () => {
      const manyPosts = Array(10).fill(null).map((_, i) => ({
        ...mockBlogPosts[0],
        id: `post-${i}`,
      }));

      const result = blogLogic.createPaginationData(manyPosts, 2, 3);

      expect(result.currentPage).toBe(2);
      expect(result.url.prev).toBe('/blog');
      expect(result.url.next).toBe('/blog/3');
    });

    it('should create correct pagination data for last page', () => {
      const result = blogLogic.createPaginationData(testPosts, 2, 1);

      expect(result.currentPage).toBe(2);
      expect(result.url.prev).toBe('/blog');
      expect(result.url.next).toBeUndefined();
    });

    it('should handle custom base path', () => {
      const result = blogLogic.createPaginationData(testPosts, 1, 1, '/custom');

      expect(result.url.current).toBe('/custom');
      expect(result.url.next).toBe('/custom/2');
    });
  });

  describe('generateBlogPaginationPaths', () => {
    it('should generate correct pagination paths', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.generateBlogPaginationPaths(1);

      expect(result).toHaveLength(2); // 2 posts, 1 per page = 2 pages
      expect(result[0].params.page).toBe('1');
      expect(result[1].params.page).toBe('2');
      expect(result[0].props.page.data).toHaveLength(1);
    });
  });

  // ==========================================
  // CATEGORY TESTS
  // ==========================================

  describe('getPostsByCategory', () => {
    it('should return posts filtered by category', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getPostsByCategory('tech');

      expect(result).toHaveLength(1);
      expect(result[0].data.category.id).toBe('tech');
    });

    it('should return empty array for non-existent category', async () => {
      mockGetCollection.mockResolvedValue([]);

      const result = await blogLogic.getPostsByCategory('non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('getCategoriesWithPostCounts', () => {
    it('should return categories with post counts', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection
        .mockResolvedValueOnce(publishedPosts) // First call for getAllPosts
        .mockResolvedValueOnce(mockCategories); // Second call for categories

      const result = await blogLogic.getCategoriesWithPostCounts();

      expect(result).toHaveLength(2);
      expect(result[0].postCount).toBe(1); // Should be sorted by count desc
      expect(result[0].data.name).toBeDefined();
    });

    it('should filter out categories with zero posts', async () => {
      mockGetCollection
        .mockResolvedValueOnce([]) // No posts
        .mockResolvedValueOnce(mockCategories);

      const result = await blogLogic.getCategoriesWithPostCounts();

      expect(result).toEqual([]);
    });
  });

  describe('generateCategoryPaths', () => {
    it('should generate category paths with correct data', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection
        .mockResolvedValueOnce(publishedPosts) // getAllPosts
        .mockResolvedValueOnce(mockCategories); // categories

      const result = await blogLogic.generateCategoryPaths();

      expect(result).toHaveLength(2); // tech and design categories
      expect(result[0].params.category).toBeDefined();
      expect(result[0].props.posts).toBeDefined();
      expect(result[0].props.categoryId).toBeDefined();
    });
  });

  // ==========================================
  // TAG TESTS
  // ==========================================

  describe('getPostsByTag', () => {
    it('should return posts filtered by tag', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getPostsByTag('javascript');

      expect(result).toHaveLength(1);
      expect(result[0].data.tags.some(tag => tag.id === 'javascript')).toBe(true);
    });
  });

  describe('getTagsWithPostCounts', () => {
    it('should return tags with post counts', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection
        .mockResolvedValueOnce(publishedPosts)
        .mockResolvedValueOnce(mockTags);

      const result = await blogLogic.getTagsWithPostCounts();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].postCount).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // AUTHOR TESTS
  // ==========================================

  describe('getPostsByAuthor', () => {
    it('should return posts by author ID', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getPostsByAuthor('author-1');

      expect(result).toHaveLength(1);
      expect(result[0].data.author.id).toBe('author-1');
    });

    it('should handle string author format', async () => {
      const postsWithStringAuthor = [{
        ...mockBlogPosts[0],
        data: { ...mockBlogPosts[0].data, author: 'author-1' }
      }];
      mockGetCollection.mockResolvedValue(postsWithStringAuthor);

      const result = await blogLogic.getPostsByAuthor('author-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getAuthorsWithPostCounts', () => {
    it('should return authors with post counts', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection
        .mockResolvedValueOnce(publishedPosts)
        .mockResolvedValueOnce(mockAuthors);

      const result = await blogLogic.getAuthorsWithPostCounts();

      expect(result).toHaveLength(2);
      expect(result[0].postCount).toBeDefined();
    });
  });

  describe('getAuthorTags', () => {
    it('should return unique tags from author posts', async () => {
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      mockGetCollection.mockResolvedValue(publishedPosts);

      const result = await blogLogic.getAuthorTags('author-1');

      expect(result).toContain('javascript');
      expect(result).toContain('web-dev');
      expect(result.length).toBe(2);
    });
  });

  // ==========================================
  // SEO TESTS
  // ==========================================

  describe('generateBlogListingSEO', () => {
    beforeEach(() => {
      mockGetCollection
        .mockResolvedValueOnce(mockSettings) // getSiteSettings
        .mockResolvedValueOnce(mockPages); // getPageData
    });

    it('should generate SEO for first page', async () => {
      const result = await blogLogic.generateBlogListingSEO(1, 3);

      expect(result.pageTitle).toBe('All Posts - Test Blog');
      expect(result.canonicalUrl).toBe('https://testblog.com/blog');
      expect(result.prevUrl).toBeUndefined();
      expect(result.nextUrl).toBe('https://testblog.com/blog/2');
    });

    it('should generate SEO for middle page', async () => {
      const result = await blogLogic.generateBlogListingSEO(2, 3);

      expect(result.pageTitle).toBe('All Posts - Page 2 - Test Blog');
      expect(result.canonicalUrl).toBe('https://testblog.com/blog/2');
      expect(result.prevUrl).toBe('https://testblog.com/blog');
      expect(result.nextUrl).toBe('https://testblog.com/blog/3');
    });

    it('should generate SEO for last page', async () => {
      const result = await blogLogic.generateBlogListingSEO(3, 3);

      expect(result.nextUrl).toBeUndefined();
    });
  });

  describe('generateCategorySEO', () => {
    it('should generate SEO for category page', async () => {
      mockGetCollection
        .mockResolvedValueOnce(mockSettings)
        .mockResolvedValueOnce(mockCategories);

      const result = await blogLogic.generateCategorySEO('technology');

      expect(result.pageTitle).toBe('Technology Posts - Test Blog');
      expect(result.canonicalUrl).toBe('https://testblog.com/categories/technology');
      expect(result.description).toContain('Tech posts');
    });

    it('should handle non-existent category', async () => {
      mockGetCollection
        .mockResolvedValueOnce(mockSettings)
        .mockResolvedValueOnce(mockCategories);

      const result = await blogLogic.generateCategorySEO('non-existent');

      expect(result.pageTitle).toBe('non-existent Posts - Test Blog');
    });
  });

  describe('generateTagSEO', () => {
    it('should generate SEO for tag page', async () => {
      mockGetCollection
        .mockResolvedValueOnce(mockSettings)
        .mockResolvedValueOnce(mockTags);

      const result = await blogLogic.generateTagSEO('javascript');

      expect(result.pageTitle).toBe('Posts tagged with: JavaScript - Test Blog');
      expect(result.canonicalUrl).toBe('https://testblog.com/tags/javascript');
    });
  });

  describe('generateAuthorSEO', () => {
    it('should generate SEO for author page', async () => {
      mockGetCollection.mockResolvedValue(mockSettings);

      const result = await blogLogic.generateAuthorSEO(mockAuthors[0]);

      expect(result.pageTitle).toBe('John Doe - Author');
      expect(result.description).toBe('Tech writer');
      expect(result.canonicalUrl).toBe('https://testblog.com/authors/author-1');
    });
  });

  describe('generateHomepageSEO', () => {
    it('should generate homepage SEO', async () => {
      mockGetCollection.mockResolvedValue(mockSettings);

      const result = await blogLogic.generateHomepageSEO();

      expect(result.pageTitle).toBe('Test Blog - A test blog');
      expect(result.canonicalUrl).toBe('https://testblog.com');
    });
  });

  // ==========================================
  // SCHEMA TESTS
  // ==========================================

  describe('generateBlogListingSchema', () => {
    it('should generate valid schema for blog listing', async () => {
      mockGetCollection.mockResolvedValue(mockSettings);

      const posts = mockBlogPosts.slice(0, 2);
      const result = await blogLogic.generateBlogListingSchema(posts, 1);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Blog');
      expect(result.mainEntity.numberOfItems).toBe(2);
      expect(result.mainEntity.itemListElement).toHaveLength(2);
    });
  });

  // ==========================================
  // UTILITY TESTS
  // ==========================================

  describe('generateShareURL', () => {
    it('should generate encoded share URL', () => {
      const result = blogLogic.generateShareURL('Test Post', 'John Doe', 'Test Blog');

      expect(result).toBe(encodeURIComponent('"Test Post" - by John Doe | Test Blog'));
    });
  });

  describe('getCurrentURL', () => {
    it('should combine site URL and pathname', () => {
      const result = blogLogic.getCurrentURL('https://example.com', '/blog/post');

      expect(result).toBe('https://example.com/blog/post');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const result = blogLogic.formatDate(date);

      expect(result).toBe('January 15, 2024');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const content = 'word '.repeat(200); // 200 words
      const result = blogLogic.calculateReadingTime(content);

      expect(result).toBe(1); // 200 words / 200 wpm = 1 minute
    });

    it('should round up reading time', () => {
      const content = 'word '.repeat(250); // 250 words
      const result = blogLogic.calculateReadingTime(content);

      expect(result).toBe(2); // 250 words / 200 wpm = 1.25, rounded up to 2
    });

    it('should handle empty content', () => {
      const result = blogLogic.calculateReadingTime('');

      expect(result).toBe(1); // Minimum 1 minute
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract frontmatter correctly', () => {
      const post = mockBlogPosts[0];
      const result = blogLogic.extractFrontmatter(post);

      expect(result.title).toBe('First Post');
      expect(result.author).toBe('author-1');
      expect(result.category).toBe('tech');
      expect(result.tags).toEqual(['javascript', 'web-dev']);
      expect(result.featured).toBe(true);
      expect(result.status).toBe('published');
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Integration Tests', () => {
    it('should work with real-world data flow', async () => {
      // Setup mock data for a complete flow
      const publishedPosts = mockBlogPosts.filter(p => p.data.status === 'published');
      
      mockGetCollection
        .mockResolvedValueOnce(publishedPosts) // getAllPosts
        .mockResolvedValueOnce(mockSettings) // getSiteSettings
        .mockResolvedValueOnce(mockPages); // getPageData

      // Test the flow: get posts -> create pagination -> generate SEO
      const posts = await blogLogic.getAllPosts();
      const pagination = blogLogic.createPaginationData(posts, 1, 5);
      const seo = await blogLogic.generateBlogListingSEO(1, pagination.lastPage);

      expect(posts).toHaveLength(2);
      expect(pagination.data).toHaveLength(2);
      expect(seo.pageTitle).toContain('Test Blog');
    });

    it('should handle edge cases gracefully', async () => {
      // Test with no data
      mockGetCollection.mockResolvedValue([]);

      const posts = await blogLogic.getAllPosts();
      const pagination = blogLogic.createPaginationData(posts, 1, 5);

      expect(posts).toEqual([]);
      expect(pagination.data).toEqual([]);
      expect(pagination.lastPage).toBe(0);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('Error Handling', () => {
    it('should handle getCollection errors gracefully', async () => {
      mockGetCollection.mockRejectedValue(new Error('Collection not found'));

      await expect(blogLogic.getAllPosts()).rejects.toThrow('Collection not found');
    });

    it('should handle malformed data gracefully', async () => {
      const malformedPosts = [
        {
          id: 'bad-post',
          data: {
            // Missing required fields
            title: 'Bad Post',
          },
        },
      ];

      mockGetCollection.mockResolvedValue(malformedPosts as any);

      // Should not throw, but handle gracefully
      const result = await blogLogic.getAllPosts();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});