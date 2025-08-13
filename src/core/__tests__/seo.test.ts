// src/core/__tests__/seo.test.ts
// Comprehensive unit tests for all SEO logic functions

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';

// Mock Astro content collections
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

// Import mocked functions
import { getCollection, getEntry } from 'astro:content';
const mockGetCollection = vi.mocked(getCollection);
const mockGetEntry = vi.mocked(getEntry);

// Import SEO functions to test
import {
  generateArticleSchema,
  generateBlogPostingSchema,
  generatePersonSchema,
  generateOrganizationSchema,
  generateImageSchema,
} from '../seo/schema';

import { generateAuthorSchemaData } from '../seo/generateAuthorSchema';
import { generateAuthorsListSchemaData } from '../seo/generateAuthorsListSchema';
import { generateBlogPostSchemaData } from '../seo/generateBlogPostSchema';

// Test data fixtures
const mockAuthor = {
  id: 'john-doe',
  name: 'John Doe',
  bio: 'Tech writer and developer',
  avatar: '/avatars/john.jpg',
  email: 'john@example.com',
  twitter: '@johndoe',
  github: 'johndoe',
  website: 'https://johndoe.com',
};

const mockSiteSettings = {
  id: 'site-config',
  siteName: 'Test Blog',
  siteDescription: 'A test blog for developers',
  siteUrl: 'https://testblog.com',
  author: 'Test Author',
  email: 'contact@testblog.com',
  logo: '/logo.png',
  imageDomain: 'https://images.testblog.com',
  defaultOgImage: '/og-default.jpg',
  social: {
    twitter: '@testblog',
    github: 'testblog',
    linkedin: 'testblog',
  },
  contact: {
    email: 'contact@testblog.com',
    github: 'testblog',
    alias: 'Test Blog Team',
  },
};

const mockBlogFrontmatter = {
  title: 'Test Blog Post',
  description: 'This is a test blog post description',
  pubDate: new Date('2024-01-15'),
  author: mockAuthor,
  category: {
    id: 'tech',
    name: 'Technology',
    description: 'Tech-related posts',
    slug: 'technology',
  },
  tags: [
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'JavaScript programming',
      slug: 'javascript',
    },
    {
      id: 'web-dev',
      name: 'Web Development',
      description: 'Web development topics',
      slug: 'web-development',
    },
  ],
  image: {
    url: '/images/test-post.jpg',
    alt: 'Test blog post image',
  },
  featured: true,
  status: 'published' as const,
};

const mockAuthorEntry = {
  id: 'john-doe',
  data: mockAuthor,
};

const mockCategoryEntry = {
  id: 'tech',
  data: {
    id: 'tech',
    name: 'Technology',
    description: 'Tech-related posts',
    slug: 'technology',
  },
};

const mockTagEntries = [
  {
    id: 'javascript',
    data: {
      id: 'javascript',
      name: 'JavaScript',
      description: 'JavaScript programming',
      slug: 'javascript',
    },
  },
  {
    id: 'web-dev',
    data: {
      id: 'web-dev',
      name: 'Web Development',
      description: 'Web development topics',
      slug: 'web-development',
    },
  },
];

const mockSettingsEntry = {
  id: 'site-config',
  data: mockSiteSettings,
};

describe('SEO Schema Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // CORE SCHEMA FUNCTIONS TESTS
  // ==========================================

  describe('generatePersonSchema', () => {
    it('should generate valid Person schema with all fields', () => {
      const result = generatePersonSchema(mockAuthor);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Person');
      expect(result.name).toBe('John Doe');
      expect(result.description).toBe('Tech writer and developer');
      expect(result.image).toBe('/avatars/john.jpg');
      expect(result.email).toBe('john@example.com');
      expect(result.url).toBe('https://johndoe.com');
      expect(result.sameAs).toContain('https://twitter.com/johndoe');
      expect(result.sameAs).toContain('https://github.com/johndoe');
    });

    it('should generate minimal Person schema with required fields only', () => {
      const minimalAuthor = {
        id: 'jane-doe',
        name: 'Jane Doe',
      };

      const result = generatePersonSchema(minimalAuthor);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Person');
      expect(result.name).toBe('Jane Doe');
      expect(result.description).toBeUndefined();
      expect(result.sameAs).toBeUndefined();
    });

    it('should handle Twitter handle with and without @ symbol', () => {
      const authorWithAt = { ...mockAuthor, twitter: '@johndoe' };
      const authorWithoutAt = { ...mockAuthor, twitter: 'johndoe' };

      const resultWithAt = generatePersonSchema(authorWithAt);
      const resultWithoutAt = generatePersonSchema(authorWithoutAt);

      expect(resultWithAt.sameAs).toContain('https://twitter.com/johndoe');
      expect(resultWithoutAt.sameAs).toContain('https://twitter.com/johndoe');
    });
  });

  describe('generateOrganizationSchema', () => {
    it('should generate valid Organization schema with all fields', () => {
      const result = generateOrganizationSchema(mockSiteSettings);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('Test Blog');
      expect(result.url).toBe('https://testblog.com');
      expect(result.logo).toBe('/logo.png');
      expect(result.sameAs).toContain('https://twitter.com/testblog');
      expect(result.sameAs).toContain('https://github.com/testblog');
      expect(result.sameAs).toContain('https://linkedin.com/company/testblog');
      expect(result.contactPoint).toBeDefined();
      expect(result.contactPoint?.email).toBe('contact@testblog.com');
    });

    it('should generate minimal Organization schema', () => {
      const minimalSettings = {
        id: 'site',
        siteName: 'Simple Blog',
        siteDescription: 'A simple blog',
        siteUrl: 'https://simpleblog.com',
        author: 'Author',
        email: 'author@simpleblog.com',
        defaultOgImage: '/og.jpg',
      };

      const result = generateOrganizationSchema(minimalSettings);

      expect(result.name).toBe('Simple Blog');
      expect(result.url).toBe('https://simpleblog.com');
      expect(result.logo).toBeUndefined();
      expect(result.sameAs).toBeUndefined();
    });
  });

  describe('generateImageSchema', () => {
    it('should generate valid ImageObject schema', () => {
      const image = {
        url: '/images/test.jpg',
        alt: 'Test image description',
      };

      const result = generateImageSchema(image);

      expect(result['@type']).toBe('ImageObject');
      expect(result.url).toBe('/images/test.jpg');
      expect(result.name).toBe('Test image description');
      expect(result.description).toBe('Test image description');
    });
  });

  describe('generateArticleSchema', () => {
    it('should generate valid Article schema with all fields', () => {
      const props = {
        frontmatter: mockBlogFrontmatter,
        url: 'https://testblog.com/blog/test-post',
        settings: mockSiteSettings,
      };

      const result = generateArticleSchema(props);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('Test Blog Post');
      expect(result.description).toBe('This is a test blog post description');
      expect(result.url).toBe('https://testblog.com/blog/test-post');
      expect(result.datePublished).toBe('2024-01-15T00:00:00.000Z');
      expect(result.dateModified).toBe('2024-01-15T00:00:00.000Z');
      expect(result.keywords).toEqual(['JavaScript', 'Web Development']);
      expect(result.articleSection).toBe('Technology');

      // Check author schema
      expect(result.author).toBeDefined();
      expect(result.author['@type']).toBe('Person');
      expect(result.author.name).toBe('John Doe');

      // Check publisher schema
      expect(result.publisher).toBeDefined();
      expect(result.publisher['@type']).toBe('Organization');
      expect(result.publisher.name).toBe('Test Blog');

      // Check image schema
      expect(result.image).toBeDefined();
      expect(result.image['@type']).toBe('ImageObject');
      expect(result.image.url).toBe('/images/test-post.jpg');

      // Check mainEntityOfPage
      expect(result.mainEntityOfPage).toBeDefined();
      expect(result.mainEntityOfPage['@type']).toBe('WebPage');
      expect(result.mainEntityOfPage['@id']).toBe('https://testblog.com/blog/test-post');
    });

    it('should generate Article schema without optional fields', () => {
      const minimalFrontmatter = {
        title: 'Minimal Post',
        description: 'Minimal description',
        pubDate: new Date('2024-01-15'),
        author: { id: 'author', name: 'Author' },
        category: { id: 'general', name: 'General' },
        tags: [],
        status: 'published' as const,
      };

      const props = {
        frontmatter: minimalFrontmatter,
        url: 'https://testblog.com/blog/minimal-post',
        settings: mockSiteSettings,
      };

      const result = generateArticleSchema(props);

      expect(result.headline).toBe('Minimal Post');
      expect(result.keywords).toEqual([]);
      expect(result.image).toBeUndefined();
      expect(result.articleSection).toBe('General');
    });
  });

  describe('generateBlogPostingSchema', () => {
    it('should generate BlogPosting schema based on Article schema', () => {
      const props = {
        frontmatter: mockBlogFrontmatter,
        url: 'https://testblog.com/blog/test-post',
        settings: mockSiteSettings,
      };

      const result = generateBlogPostingSchema(props);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BlogPosting');
      expect(result.headline).toBe('Test Blog Post');
      expect(result.description).toBe('This is a test blog post description');
      
      // Should have all Article properties
      expect(result.author).toBeDefined();
      expect(result.publisher).toBeDefined();
      expect(result.datePublished).toBeDefined();
    });
  });

  // ==========================================
  // AUTHOR SCHEMA TESTS
  // ==========================================

  describe('generateAuthorSchemaData', () => {
    beforeEach(() => {
      mockGetCollection.mockResolvedValue([mockSettingsEntry]);
    });

    it('should generate enhanced author schema with site context', async () => {
      const author = {
        id: 'john-doe',
        data: mockAuthor,
      };

      const result = await generateAuthorSchemaData(
        author,
        'https://testblog.com/authors/john-doe',
        5
      );

      expect(result).toBeDefined();
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Person');
      expect(result['@id']).toBe('https://testblog.com/authors/john-doe');
      expect(result.name).toBe('John Doe');
      expect(result.jobTitle).toBe('Author at Test Blog');
      expect(result.worksFor).toBeDefined();
      expect(result.worksFor.name).toBe('Test Blog');
      expect(result.knowsAbout).toContain('5 published articles');
      expect(result.mainEntityOfPage).toBeDefined();
      expect(result.mainEntityOfPage['@type']).toBe('ProfilePage');
    });

    it('should handle missing site settings gracefully', async () => {
      mockGetCollection.mockResolvedValue([]);

      const author = {
        id: 'john-doe',
        data: mockAuthor,
      };

      const result = await generateAuthorSchemaData(
        author,
        'https://testblog.com/authors/john-doe',
        0
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.jobTitle).toBeUndefined();
      expect(result.knowsAbout).toBeUndefined();
    });

    it('should return null for invalid author data', async () => {
      const invalidAuthor = {
        id: 'invalid',
        data: {}, // Missing name
      };

      const result = await generateAuthorSchemaData(
        invalidAuthor as any,
        'https://testblog.com/authors/invalid'
      );

      expect(result).toBeNull();
    });

    it('should create fallback schema on error', async () => {
      mockGetCollection.mockRejectedValue(new Error('Collection error'));

      const author = {
        id: 'john-doe',
        data: mockAuthor,
      };

      const result = await generateAuthorSchemaData(
        author,
        'https://testblog.com/authors/john-doe'
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result['@type']).toBe('Person');
    });
  });

  // ==========================================
  // AUTHORS LIST SCHEMA TESTS
  // ==========================================

  describe('generateAuthorsListSchemaData', () => {
    const mockAuthors = [
      {
        id: 'john-doe',
        data: mockAuthor,
        postCount: 5,
      },
      {
        id: 'jane-smith',
        data: {
          id: 'jane-smith',
          name: 'Jane Smith',
          bio: 'Design expert',
          avatar: '/avatars/jane.jpg',
        },
        postCount: 3,
      },
    ];

    beforeEach(() => {
      mockGetCollection.mockResolvedValue([mockSettingsEntry]);
    });

    it('should generate authors list schema with all authors', async () => {
      const result = await generateAuthorsListSchemaData(
        mockAuthors,
        'https://testblog.com/authors'
      );

      expect(result).toBeDefined();
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('CollectionPage');
      expect(result['@id']).toBe('https://testblog.com/authors');
      expect(result.name).toBe('Authors - Test Blog');
      expect(result.description).toContain('Test Blog');

      // Check mainEntity
      expect(result.mainEntity).toBeDefined();
      expect(result.mainEntity['@type']).toBe('ItemList');
      expect(result.mainEntity.numberOfItems).toBe(2);
      expect(result.mainEntity.itemListElement).toHaveLength(2);

      // Check first author in list
      const firstAuthor = result.mainEntity.itemListElement[0];
      expect(firstAuthor['@type']).toBe('ListItem');
      expect(firstAuthor.position).toBe(1);
      expect(firstAuthor.item.name).toBe('John Doe');
      expect(firstAuthor.item.knowsAbout).toContain('5 published articles');

      // Check breadcrumb
      expect(result.breadcrumb).toBeDefined();
      expect(result.breadcrumb['@type']).toBe('BreadcrumbList');
      expect(result.breadcrumb.itemListElement).toHaveLength(2);
    });

    it('should return null for empty authors array', async () => {
      const result = await generateAuthorsListSchemaData(
        [],
        'https://testblog.com/authors'
      );

      expect(result).toBeNull();
    });

    it('should return null for invalid input', async () => {
      const result = await generateAuthorsListSchemaData(
        null as any,
        'https://testblog.com/authors'
      );

      expect(result).toBeNull();
    });

    it('should handle missing site settings gracefully', async () => {
      mockGetCollection.mockResolvedValue([]);

      const result = await generateAuthorsListSchemaData(
        mockAuthors,
        'https://testblog.com/authors'
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Authors - Website');
      expect(result.isPartOf).toBeUndefined();
    });

    it('should create fallback schema on error', async () => {
      mockGetCollection.mockRejectedValue(new Error('Collection error'));

      const result = await generateAuthorsListSchemaData(
        mockAuthors,
        'https://testblog.com/authors'
      );

      expect(result).toBeDefined();
      expect(result['@type']).toBe('CollectionPage');
      expect(result.mainEntity.numberOfItems).toBe(2);
    });
  });

  // ==========================================
  // BLOG POST SCHEMA TESTS
  // ==========================================

  describe('generateBlogPostSchemaData', () => {
    const mockFrontmatterInput = {
      title: 'Test Blog Post',
      description: 'This is a test blog post description',
      pubDate: new Date('2024-01-15'),
      author: 'john-doe',
      category: 'tech',
      tags: ['javascript', 'web-dev'],
      image: {
        url: '/images/test-post.jpg',
        alt: 'Test blog post image',
      },
      featured: true,
      status: 'published' as const,
    };

    beforeEach(() => {
      mockGetEntry
        .mockImplementation((collection, id) => {
          if (collection === 'authors' && id === 'john-doe') {
            return Promise.resolve(mockAuthorEntry);
          }
          if (collection === 'categories' && id === 'tech') {
            return Promise.resolve(mockCategoryEntry);
          }
          if (collection === 'tags' && (id === 'javascript' || id === 'web-dev')) {
            return Promise.resolve(mockTagEntries.find(tag => tag.id === id));
          }
          if (collection === 'settings' && id === 'site-config') {
            return Promise.resolve(mockSettingsEntry);
          }
          return Promise.resolve(null);
        });
    });

    it('should generate Article schema for published post', async () => {
      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('Test Blog Post');
      expect(result.description).toBe('This is a test blog post description');
      expect(result.url).toBe('https://testblog.com/blog/test-post');
      expect(result.datePublished).toBe('2024-01-15T00:00:00.000Z');

      // Check resolved author data
      expect(result.author).toBeDefined();
      expect(result.author.name).toBe('John Doe');
      expect(result.author.description).toBe('Tech writer and developer');

      // Check resolved category
      expect(result.articleSection).toBe('Technology');

      // Check resolved tags
      expect(result.keywords).toContain('JavaScript');
      expect(result.keywords).toContain('Web Development');
    });

    it('should generate BlogPosting schema for published post', async () => {
      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'BlogPosting'
      );

      expect(result).toBeDefined();
      expect(result['@type']).toBe('BlogPosting');
      expect(result.headline).toBe('Test Blog Post');
    });

    it('should return null for draft posts', async () => {
      const draftFrontmatter = {
        ...mockFrontmatterInput,
        status: 'draft' as const,
      };

      const result = await generateBlogPostSchemaData(
        draftFrontmatter,
        'https://testblog.com/blog/draft-post',
        'Article'
      );

      expect(result).toBeNull();
    });

    it('should return null for missing required fields', async () => {
      const invalidFrontmatter = {
        title: '', // Empty title
        description: 'Description',
        pubDate: new Date(),
        author: 'john-doe',
        category: 'tech',
        tags: [],
        status: 'published' as const,
      };

      const result = await generateBlogPostSchemaData(
        invalidFrontmatter,
        'https://testblog.com/blog/invalid-post',
        'Article'
      );

      expect(result).toBeNull();
    });

    it('should handle missing author data gracefully', async () => {
      mockGetEntry.mockImplementation((collection, id) => {
        if (collection === 'authors') return Promise.resolve(null);
        if (collection === 'categories' && id === 'tech') {
          return Promise.resolve(mockCategoryEntry);
        }
        if (collection === 'settings' && id === 'site-config') {
          return Promise.resolve(mockSettingsEntry);
        }
        return Promise.resolve(null);
      });

      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result.author.name).toBe('john-doe'); // Fallback to ID
    });

    it('should handle missing category data gracefully', async () => {
      mockGetEntry.mockImplementation((collection, id) => {
        if (collection === 'authors' && id === 'john-doe') {
          return Promise.resolve(mockAuthorEntry);
        }
        if (collection === 'categories') return Promise.resolve(null);
        if (collection === 'settings' && id === 'site-config') {
          return Promise.resolve(mockSettingsEntry);
        }
        return Promise.resolve(null);
      });

      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result.articleSection).toBe('tech'); // Fallback to ID
    });

    it('should handle missing tags data gracefully', async () => {
      mockGetEntry.mockImplementation((collection, id) => {
        if (collection === 'authors' && id === 'john-doe') {
          return Promise.resolve(mockAuthorEntry);
        }
        if (collection === 'categories' && id === 'tech') {
          return Promise.resolve(mockCategoryEntry);
        }
        if (collection === 'tags') return Promise.resolve(null);
        if (collection === 'settings' && id === 'site-config') {
          return Promise.resolve(mockSettingsEntry);
        }
        return Promise.resolve(null);
      });

      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result.keywords).toEqual(['javascript', 'web-dev']); // Fallback to IDs
    });

    it('should create minimal fallback schema on error', async () => {
      mockGetEntry.mockRejectedValue(new Error('Collection error'));

      const result = await generateBlogPostSchemaData(
        mockFrontmatterInput,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('Test Blog Post');
      expect(result.author.name).toBe('john-doe');
    });

    it('should return null for completely invalid input', async () => {
      const result = await generateBlogPostSchemaData(
        null as any,
        'https://testblog.com/blog/test-post',
        'Article'
      );

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('SEO Integration Tests', () => {
    it('should work with complete data flow', async () => {
      // Setup complete mock data
      mockGetCollection.mockResolvedValue([mockSettingsEntry]);
      mockGetEntry.mockImplementation((collection, id) => {
        if (collection === 'authors' && id === 'john-doe') {
          return Promise.resolve(mockAuthorEntry);
        }
        if (collection === 'categories' && id === 'tech') {
          return Promise.resolve(mockCategoryEntry);
        }
        if (collection === 'tags') {
          return Promise.resolve(mockTagEntries.find(tag => tag.id === id));
        }
        if (collection === 'settings' && id === 'site-config') {
          return Promise.resolve(mockSettingsEntry);
        }
        return Promise.resolve(null);
      });

      // Test complete flow: blog post -> author -> authors list
      const blogPostSchema = await generateBlogPostSchemaData(
        {
          title: 'Integration Test Post',
          description: 'Testing integration',
          pubDate: new Date('2024-01-15'),
          author: 'john-doe',
          category: 'tech',
          tags: ['javascript'],
          status: 'published' as const,
        },
        'https://testblog.com/blog/integration-test',
        'Article'
      );

      const authorSchema = await generateAuthorSchemaData(
        { id: 'john-doe', data: mockAuthor },
        'https://testblog.com/authors/john-doe',
        1
      );

      const authorsListSchema = await generateAuthorsListSchemaData(
        [{ id: 'john-doe', data: mockAuthor, postCount: 1 }],
        'https://testblog.com/authors'
      );

      // Verify all schemas are generated correctly
      expect(blogPostSchema).toBeDefined();
      expect(blogPostSchema['@type']).toBe('Article');
      expect(blogPostSchema.author.name).toBe('John Doe');

      expect(authorSchema).toBeDefined();
      expect(authorSchema['@type']).toBe('Person');
      expect(authorSchema.name).toBe('John Doe');

      expect(authorsListSchema).toBeDefined();
      expect(authorsListSchema['@type']).toBe('CollectionPage');
      expect(authorsListSchema.mainEntity.numberOfItems).toBe(1);
    });

    it('should handle mixed success/failure scenarios', async () => {
      // Some data succeeds, some fails
      mockGetCollection.mockResolvedValue([mockSettingsEntry]);
      mockGetEntry.mockImplementation((collection, id) => {
        if (collection === 'authors') {
          throw new Error('Author collection error');
        }
        if (collection === 'categories' && id === 'tech') {
          return Promise.resolve(mockCategoryEntry);
        }
        return Promise.resolve(null);
      });

      const result = await generateBlogPostSchemaData(
        {
          title: 'Mixed Test Post',
          description: 'Testing mixed scenarios',
          pubDate: new Date('2024-01-15'),
          author: 'john-doe',
          category: 'tech',
          tags: [],
          status: 'published' as const,
        },
        'https://testblog.com/blog/mixed-test',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result.author.name).toBe('john-doe'); // Fallback
      expect(result.articleSection).toBe('Technology'); // Resolved
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('SEO Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockGetCollection.mockRejectedValue(new Error('Network error'));
      mockGetEntry.mockRejectedValue(new Error('Network error'));

      const result = await generateBlogPostSchemaData(
        {
          title: 'Error Test Post',
          description: 'Testing error handling',
          pubDate: new Date('2024-01-15'),
          author: 'john-doe',
          category: 'tech',
          tags: ['javascript'],
          status: 'published' as const,
        },
        'https://testblog.com/blog/error-test',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe('Error Test Post');
    });

    it('should handle malformed data gracefully', async () => {
      mockGetEntry.mockResolvedValue({
        id: 'malformed',
        data: null, // Malformed data
      });

      const result = await generateBlogPostSchemaData(
        {
          title: 'Malformed Test Post',
          description: 'Testing malformed data',
          pubDate: new Date('2024-01-15'),
          author: 'malformed-author',
          category: 'malformed-category',
          tags: ['malformed-tag'],
          status: 'published' as const,
        },
        'https://testblog.com/blog/malformed-test',
        'Article'
      );

      expect(result).toBeDefined();
      expect(result.headline).toBe('Malformed Test Post');
    });
  });
});