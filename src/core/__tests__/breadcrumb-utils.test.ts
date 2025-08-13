// src/core/__tests__/breadcrumb-utils.test.ts
// Comprehensive unit tests for breadcrumb utilities

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import {
  generateBreadcrumbs,
  getBlogPostBreadcrumbs,
  getCategoryBreadcrumbs,
  getTagBreadcrumbs,
  getAuthorBreadcrumbs,
  safeDecodeURIComponent,
  validateBreadcrumbs,
  breadcrumbConfig,
  type BreadcrumbItem,
  type PageData
} from '../navigation/breadcrumbUtils';

describe('Breadcrumb Utils Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test data fixtures
  const mockBlogPost: CollectionEntry<'blog'> = {
    id: 'test-post',
    slug: 'test-post',
    body: 'Test content',
    collection: 'blog',
    data: {
      title: 'Test Blog Post',
      description: 'A test blog post',
      pubDate: new Date('2024-01-15'),
      status: 'published',
      author: { id: 'author-1' },
      category: { id: 'tech' },
      tags: [{ id: 'javascript' }, { id: 'web-dev' }],
      featured: false,
    },
  };

  const mockCategory: CollectionEntry<'categories'> = {
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
  };

  const mockTag: CollectionEntry<'tags'> = {
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
  };

  const mockAuthor: CollectionEntry<'authors'> = {
    id: 'author-1',
    slug: 'author-1',
    body: '',
    collection: 'authors',
    data: {
      name: 'John Doe',
      bio: 'Tech writer',
      avatar: '/avatar1.jpg',
    },
  };

  const mockPageData: PageData = {
    title: 'Test Page',
    category: {
      id: 'tech',
      name: 'Technology',
      slug: 'technology',
    },
    tags: [
      {
        id: 'javascript',
        name: 'JavaScript',
        slug: 'javascript',
      },
    ],
    author: {
      id: 'author-1',
      name: 'John Doe',
    },
  };

  // ==========================================
  // GENERATE BREADCRUMBS TESTS
  // ==========================================

  describe('generateBreadcrumbs', () => {
    it('should return empty array for homepage', () => {
      const result = generateBreadcrumbs('/');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty pathname', () => {
      const result = generateBreadcrumbs('');
      expect(result).toEqual([]);
    });

    it('should generate breadcrumbs for blog index page', () => {
      const result = generateBreadcrumbs('/blog');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Home',
        url: '/',
        position: 1,
      });
      expect(result[1]).toEqual({
        name: 'Blog',
        isCurrentPage: true,
        position: 2,
      });
    });

    it('should generate breadcrumbs for blog post with page data', () => {
      const result = generateBreadcrumbs('/blog/test-post', mockPageData);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Technology');
      expect(result[2].url).toBe('/categories/technology');
      expect(result[3].name).toBe('Test Page');
      expect(result[3].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for blog post without page data', () => {
      const result = generateBreadcrumbs('/blog/test-post');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
    });

    it('should generate breadcrumbs for categories index page', () => {
      const result = generateBreadcrumbs('/categories');

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2]).toEqual({
        name: 'Categories',
        isCurrentPage: true,
        position: 3,
      });
    });

    it('should generate breadcrumbs for specific category page', () => {
      const result = generateBreadcrumbs('/categories/technology', mockPageData);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Categories');
      expect(result[3].name).toBe('Technology');
      expect(result[3].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for tags index page', () => {
      const result = generateBreadcrumbs('/tags');

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2]).toEqual({
        name: 'Tags',
        isCurrentPage: true,
        position: 3,
      });
    });

    it('should generate breadcrumbs for specific tag page', () => {
      const result = generateBreadcrumbs('/tags/javascript', mockPageData);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Tags');
      expect(result[3].name).toBe('JavaScript');
      expect(result[3].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for authors index page', () => {
      const result = generateBreadcrumbs('/authors');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home');
      expect(result[1]).toEqual({
        name: 'Authors',
        isCurrentPage: true,
        position: 2,
      });
    });

    it('should generate breadcrumbs for specific author page', () => {
      const result = generateBreadcrumbs('/authors/john-doe', mockPageData);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Authors');
      expect(result[2].name).toBe('John Doe');
      expect(result[2].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for legal pages', () => {
      const legalPageData: PageData = {
        title: 'Privacy Policy',
      };
      const result = generateBreadcrumbs('/legal/privacy', legalPageData);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Privacy Policy');
      expect(result[1].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for generic pages', () => {
      const genericPageData: PageData = {
        title: 'About Us',
      };
      const result = generateBreadcrumbs('/about', genericPageData);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('About Us');
      expect(result[1].isCurrentPage).toBe(true);
    });

    it('should handle URL-encoded paths', () => {
      const result = generateBreadcrumbs('/categories/coffee%20brewing');

      expect(result).toHaveLength(4);
      expect(result[3].name).toBe('coffee brewing');
    });

    it('should handle errors gracefully', () => {
      // Mock console.warn to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Pass invalid pathname that might cause errors
      const result = generateBreadcrumbs(null as any);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error generating breadcrumbs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // SPECIFIC BREADCRUMB FUNCTION TESTS
  // ==========================================

  describe('getBlogPostBreadcrumbs', () => {
    it('should generate breadcrumbs for blog post', () => {
      const result = getBlogPostBreadcrumbs(mockBlogPost);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: 'Home',
        url: '/',
        position: 1,
      });
      expect(result[1]).toEqual({
        name: 'Blog',
        url: '/blog',
        position: 2,
      });
      expect(result[2]).toEqual({
        name: 'tech', // Category ID as fallback
        url: '/categories/tech',
        position: 3,
      });
      expect(result[3]).toEqual({
        name: 'Test Blog Post',
        isCurrentPage: true,
        position: 4,
      });
    });

    it('should generate breadcrumbs for blog post without category', () => {
      const postWithoutCategory = {
        ...mockBlogPost,
        data: {
          ...mockBlogPost.data,
          category: undefined,
        },
      };

      const result = getBlogPostBreadcrumbs(postWithoutCategory as any);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Test Blog Post');
      expect(result[2].isCurrentPage).toBe(true);
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getBlogPostBreadcrumbs(null as any);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error generating blog post breadcrumbs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getCategoryBreadcrumbs', () => {
    it('should generate breadcrumbs for category with data', () => {
      const result = getCategoryBreadcrumbs('tech', mockCategory);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Categories');
      expect(result[3]).toEqual({
        name: 'Technology',
        isCurrentPage: true,
        position: 4,
      });
    });

    it('should generate breadcrumbs for category without data', () => {
      const result = getCategoryBreadcrumbs('tech');

      expect(result).toHaveLength(4);
      expect(result[3]).toEqual({
        name: 'tech', // Fallback to ID
        isCurrentPage: true,
        position: 4,
      });
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getCategoryBreadcrumbs(null as any);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error generating category breadcrumbs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getTagBreadcrumbs', () => {
    it('should generate breadcrumbs for tag with data', () => {
      const result = getTagBreadcrumbs('javascript', mockTag);

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
      expect(result[2].name).toBe('Tags');
      expect(result[3]).toEqual({
        name: 'JavaScript',
        isCurrentPage: true,
        position: 4,
      });
    });

    it('should generate breadcrumbs for tag without data', () => {
      const result = getTagBreadcrumbs('javascript');

      expect(result).toHaveLength(4);
      expect(result[3]).toEqual({
        name: 'javascript', // Fallback to slug
        isCurrentPage: true,
        position: 4,
      });
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getTagBreadcrumbs(null as any);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error generating tag breadcrumbs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getAuthorBreadcrumbs', () => {
    it('should generate breadcrumbs for author with data', () => {
      const result = getAuthorBreadcrumbs('author-1', mockAuthor);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Authors');
      expect(result[2]).toEqual({
        name: 'John Doe',
        isCurrentPage: true,
        position: 3,
      });
    });

    it('should generate breadcrumbs for author without data', () => {
      const result = getAuthorBreadcrumbs('author-1');

      expect(result).toHaveLength(3);
      expect(result[2]).toEqual({
        name: 'author-1', // Fallback to ID
        isCurrentPage: true,
        position: 3,
      });
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getAuthorBreadcrumbs(null as any);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error generating author breadcrumbs:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // UTILITY FUNCTION TESTS
  // ==========================================

  describe('safeDecodeURIComponent', () => {
    it('should decode valid URI components', () => {
      expect(safeDecodeURIComponent('hello%20world')).toBe('hello world');
      expect(safeDecodeURIComponent('coffee%20brewing')).toBe('coffee brewing');
      expect(safeDecodeURIComponent('test%2Bpost')).toBe('test+post');
    });

    it('should return original string for invalid URI components', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(safeDecodeURIComponent('%')).toBe('%');
      expect(safeDecodeURIComponent('%%')).toBe('%%');
      expect(safeDecodeURIComponent('%ZZ')).toBe('%ZZ');

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      consoleSpy.mockRestore();
    });

    it('should handle empty strings', () => {
      expect(safeDecodeURIComponent('')).toBe('');
    });

    it('should handle strings without encoding', () => {
      expect(safeDecodeURIComponent('normal-string')).toBe('normal-string');
      expect(safeDecodeURIComponent('test123')).toBe('test123');
    });
  });

  describe('validateBreadcrumbs', () => {
    it('should validate and clean valid breadcrumb items', () => {
      const validItems: BreadcrumbItem[] = [
        { name: 'Home', url: '/', position: 1 },
        { name: 'Blog', url: '/blog', position: 2 },
        { name: 'Current Page', isCurrentPage: true, position: 3 },
      ];

      const result = validateBreadcrumbs(validItems);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'Home', url: '/', position: 1 });
      expect(result[1]).toEqual({ name: 'Blog', url: '/blog', position: 2 });
      expect(result[2]).toEqual({ name: 'Current Page', isCurrentPage: true, position: 3 });
    });

    it('should filter out invalid breadcrumb items', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mixedItems: BreadcrumbItem[] = [
        { name: 'Valid Item', url: '/' },
        { name: '', url: '/empty' }, // Empty name
        { name: 'Another Valid', url: '/valid' },
        { name: null as any, url: '/null' }, // Null name
        { name: 'Valid Without URL' },
        { name: 'Invalid URL', url: 123 as any }, // Invalid URL type
      ];

      const result = validateBreadcrumbs(mixedItems);

      expect(result).toHaveLength(2); // Only 2 valid items
      expect(result[0].name).toBe('Valid Item');
      expect(result[1].name).toBe('Another Valid');
      expect(consoleSpy).toHaveBeenCalledTimes(3); // 3 invalid items

      consoleSpy.mockRestore();
    });

    it('should fix sequential positions', () => {
      const itemsWithBadPositions: BreadcrumbItem[] = [
        { name: 'First', position: 5 },
        { name: 'Second', position: 10 },
        { name: 'Third', position: 1 },
      ];

      const result = validateBreadcrumbs(itemsWithBadPositions);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'First', position: 1 });
      expect(result[1]).toEqual({ name: 'Second', position: 2 });
      expect(result[2]).toEqual({ name: 'Third', position: 3 });
    });

    it('should handle empty array', () => {
      const result = validateBreadcrumbs([]);
      expect(result).toEqual([]);
    });

    it('should handle items without positions', () => {
      const itemsWithoutPositions: BreadcrumbItem[] = [
        { name: 'First' },
        { name: 'Second' },
        { name: 'Third' },
      ];

      const result = validateBreadcrumbs(itemsWithoutPositions);

      expect(result).toHaveLength(3);
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
    });
  });

  // ==========================================
  // CONFIGURATION TESTS
  // ==========================================

  describe('breadcrumbConfig', () => {
    it('should have all required labels', () => {
      expect(breadcrumbConfig.homeLabel).toBe('Home');
      expect(breadcrumbConfig.blogLabel).toBe('Blog');
      expect(breadcrumbConfig.categoriesLabel).toBe('Categories');
      expect(breadcrumbConfig.tagsLabel).toBe('Tags');
      expect(breadcrumbConfig.authorsLabel).toBe('Authors');
    });

    it('should have string values for all labels', () => {
      Object.values(breadcrumbConfig).forEach(label => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Breadcrumb Integration Tests', () => {
    it('should work with complete blog post flow', () => {
      // Test the flow: blog post -> category -> tags -> author
      const blogBreadcrumbs = getBlogPostBreadcrumbs(mockBlogPost);
      const categoryBreadcrumbs = getCategoryBreadcrumbs('tech', mockCategory);
      const tagBreadcrumbs = getTagBreadcrumbs('javascript', mockTag);
      const authorBreadcrumbs = getAuthorBreadcrumbs('author-1', mockAuthor);

      // All should start with Home
      expect(blogBreadcrumbs[0].name).toBe('Home');
      expect(categoryBreadcrumbs[0].name).toBe('Home');
      expect(tagBreadcrumbs[0].name).toBe('Home');
      expect(authorBreadcrumbs[0].name).toBe('Home');

      // Blog post should have the most breadcrumbs
      expect(blogBreadcrumbs.length).toBeGreaterThan(categoryBreadcrumbs.length);

      // All should have proper current page markers
      expect(blogBreadcrumbs[blogBreadcrumbs.length - 1].isCurrentPage).toBe(true);
      expect(categoryBreadcrumbs[categoryBreadcrumbs.length - 1].isCurrentPage).toBe(true);
      expect(tagBreadcrumbs[tagBreadcrumbs.length - 1].isCurrentPage).toBe(true);
      expect(authorBreadcrumbs[authorBreadcrumbs.length - 1].isCurrentPage).toBe(true);
    });

    it('should handle complex URL structures', () => {
      const complexPaths = [
        '/blog/2024/01/my-post',
        '/categories/web-development/advanced',
        '/tags/javascript/tutorials',
        '/authors/john-doe/posts',
      ];

      complexPaths.forEach(path => {
        const result = generateBreadcrumbs(path, mockPageData);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].name).toBe('Home');
      });
    });

    it('should maintain consistent structure across different page types', () => {
      const paths = [
        '/blog',
        '/categories',
        '/tags',
        '/authors',
      ];

      paths.forEach(path => {
        const result = generateBreadcrumbs(path);
        
        // All should start with Home
        expect(result[0].name).toBe('Home');
        
        // All should have current page marker on last item
        expect(result[result.length - 1].isCurrentPage).toBe(true);
        
        // All should have sequential positions
        result.forEach((item, index) => {
          expect(item.position).toBe(index + 1);
        });
      });
    });
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================

  describe('Breadcrumb Edge Cases', () => {
    it('should handle very long page names', () => {
      const longPageData: PageData = {
        title: 'This is a very long page title that might cause issues with breadcrumb display and should be handled gracefully by the breadcrumb system',
      };

      const result = generateBreadcrumbs('/long-page', longPageData);

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe(longPageData.title);
    });

    it('should handle special characters in page names', () => {
      const specialPageData: PageData = {
        title: 'Page with "quotes", <tags>, & symbols!',
        category: {
          id: 'special',
          name: 'Special & Unique',
          slug: 'special-unique',
        },
      };

      const result = generateBreadcrumbs('/blog/special-post', specialPageData);

      expect(result[2].name).toBe('Special & Unique');
      expect(result[3].name).toBe('Page with "quotes", <tags>, & symbols!');
    });

    it('should handle missing or undefined page data gracefully', () => {
      const result = generateBreadcrumbs('/blog/test-post', undefined);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Home');
      expect(result[1].name).toBe('Blog');
    });

    it('should handle malformed URLs', () => {
      const malformedUrls = [
        '//double-slash',
        '/trailing/slash/',
        '/with//double//slashes',
        '/with spaces in url',
      ];

      malformedUrls.forEach(url => {
        expect(() => {
          const result = generateBreadcrumbs(url);
          expect(Array.isArray(result)).toBe(true);
        }).not.toThrow();
      });
    });

    it('should handle empty or null page data properties', () => {
      const emptyPageData: PageData = {
        title: '',
        category: {
          id: '',
          name: '',
          slug: '',
        },
        tags: [],
        author: {
          id: '',
          name: '',
        },
      };

      const result = generateBreadcrumbs('/blog/empty-post', emptyPageData);

      // Should still generate breadcrumbs, even with empty data
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Home');
    });
  });
});