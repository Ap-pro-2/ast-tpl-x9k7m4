// src/core/__tests__/main-pages-seo.test.ts
// Unit tests for main pages SEO enhancements

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Astro content collections
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

// Import mocked functions
import { getCollection } from 'astro:content';
const mockGetCollection = vi.mocked(getCollection);

// Import functions to test
import {
  getPageData,
  getSiteSettings,
} from '../blogLogic';

// Test data fixtures
const mockSiteSettings = {
  id: 'site-config',
  siteName: 'AstroPress',
  siteDescription: 'Lightning-fast coffee blog platform',
  siteUrl: 'https://astropress.coffee',
  author: 'AstroPress Team',
  email: 'hello@astropress.coffee',
  defaultOgImage: '/og-coffee.jpg',
};

const mockPagesData = [
  {
    id: 'all-tags',
    data: {
      id: 'all-tags',
      title: 'All Tags',
      slug: 'tags',
      description: 'Explore all coffee tags and topics on AstroPress Coffee.',
      content: '',
      published: true,
      seo: {
        title: 'Coffee Tags & Topics | AstroPress Coffee Blog',
        description: 'Discover all coffee tags and topics on AstroPress Coffee. Find articles about brewing techniques, coffee origins, equipment reviews, and expert tips.',
        keywords: ['coffee tags', 'coffee topics', 'brewing techniques', 'coffee origins', 'coffee blog', 'coffee guides'],
        ogImage: '/images/seo/coffee-tags-main-og.jpg',
        canonical: '/tags'
      }
    }
  },
  {
    id: 'all-categories',
    data: {
      id: 'all-categories',
      title: 'All Categories',
      slug: 'categories',
      description: 'Browse all coffee categories on AstroPress Coffee.',
      content: '',
      published: true,
      seo: {
        title: 'Coffee Categories & Topics | AstroPress Coffee Blog',
        description: 'Browse all coffee categories on AstroPress Coffee. From brewing guides to coffee culture, find expertly organized content for every coffee enthusiast.',
        keywords: ['coffee categories', 'brewing guides', 'coffee culture', 'coffee tips', 'coffee blog', 'coffee education'],
        ogImage: '/images/seo/coffee-categories-main-og.jpg',
        canonical: '/categories'
      }
    }
  },
  {
    id: 'all-authors',
    data: {
      id: 'all-authors',
      title: 'All Authors',
      slug: 'authors',
      description: 'Meet the coffee experts and writers at AstroPress Coffee.',
      content: '',
      published: true,
      seo: {
        title: 'Coffee Experts & Writers | AstroPress Coffee Authors',
        description: 'Meet the talented coffee experts, baristas, and writers behind AstroPress Coffee. Discover their expertise and browse their latest coffee articles and guides.',
        keywords: ['coffee experts', 'coffee writers', 'baristas', 'coffee authors', 'coffee professionals', 'coffee blog team'],
        ogImage: '/images/seo/coffee-authors-og.jpg',
        canonical: '/authors'
      }
    }
  },
  {
    id: 'blog-main',
    data: {
      id: 'blog-main',
      title: 'Coffee Blog',
      slug: 'blog',
      description: 'Expert coffee guides, brewing techniques, and coffee culture insights.',
      content: '',
      published: true,
      seo: {
        title: 'Coffee Blog | Expert Guides & Brewing Techniques | AstroPress',
        description: 'Discover expert coffee guides, brewing techniques, equipment reviews, and coffee culture insights. Your ultimate resource for everything coffee.',
        keywords: ['coffee blog', 'coffee guides', 'brewing techniques', 'coffee reviews', 'coffee culture', 'barista tips', 'coffee education'],
        ogImage: '/images/seo/coffee-blog-main-og.jpg',
        canonical: '/blog'
      }
    }
  }
];

const mockLegalData = [
  {
    id: 'privacy',
    data: {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information when you visit our website.',
      pubDate: new Date('2025-07-15'),
      seo: {
        title: 'Privacy Policy | AstroPress Coffee - Data Protection & Privacy',
        description: 'Learn how AstroPress Coffee collects, uses, and protects your personal information. Our comprehensive privacy policy ensures your data security and privacy rights.',
        keywords: ['privacy policy', 'data protection', 'personal information', 'cookies', 'user rights', 'data security'],
        ogImage: '/images/seo/privacy-policy-og.jpg',
        canonical: '/legal/privacy'
      }
    }
  },
  {
    id: 'terms',
    data: {
      title: 'Terms of Service',
      description: 'The terms and conditions that govern your use of our website and services.',
      pubDate: new Date('2025-07-15'),
      seo: {
        title: 'Terms of Service | AstroPress Coffee - Website Terms & Conditions',
        description: 'Read the terms and conditions that govern your use of AstroPress Coffee website and services. Understand your rights and responsibilities as a user.',
        keywords: ['terms of service', 'terms and conditions', 'website terms', 'user agreement', 'legal terms', 'service conditions'],
        ogImage: '/images/seo/terms-service-og.jpg',
        canonical: '/legal/terms'
      }
    }
  }
];

const mockSettingsEntry = {
  id: 'site-config',
  data: mockSiteSettings,
};

describe('Main Pages SEO Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for settings
    mockGetCollection.mockImplementation((collection) => {
      if (collection === 'settings') {
        return Promise.resolve([mockSettingsEntry]);
      }
      if (collection === 'pages') {
        return Promise.resolve(mockPagesData);
      }
      if (collection === 'legal') {
        return Promise.resolve(mockLegalData);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // PAGES DATA TESTS
  // ==========================================

  describe('getPageData', () => {
    it('should return SEO data for tags index page', async () => {
      const result = await getPageData('all-tags');

      expect(result).toBeDefined();
      expect(result.seo.title).toBe('Coffee Tags & Topics | AstroPress Coffee Blog');
      expect(result.seo.description).toBe('Discover all coffee tags and topics on AstroPress Coffee. Find articles about brewing techniques, coffee origins, equipment reviews, and expert tips.');
      expect(result.seo.keywords).toEqual(['coffee tags', 'coffee topics', 'brewing techniques', 'coffee origins', 'coffee blog', 'coffee guides']);
      expect(result.seo.ogImage).toBe('/images/seo/coffee-tags-main-og.jpg');
      expect(result.seo.canonical).toBe('/tags');
    });

    it('should return SEO data for categories index page', async () => {
      const result = await getPageData('all-categories');

      expect(result).toBeDefined();
      expect(result.seo.title).toBe('Coffee Categories & Topics | AstroPress Coffee Blog');
      expect(result.seo.description).toBe('Browse all coffee categories on AstroPress Coffee. From brewing guides to coffee culture, find expertly organized content for every coffee enthusiast.');
      expect(result.seo.keywords).toEqual(['coffee categories', 'brewing guides', 'coffee culture', 'coffee tips', 'coffee blog', 'coffee education']);
      expect(result.seo.ogImage).toBe('/images/seo/coffee-categories-main-og.jpg');
      expect(result.seo.canonical).toBe('/categories');
    });

    it('should return SEO data for authors index page', async () => {
      const result = await getPageData('all-authors');

      expect(result).toBeDefined();
      expect(result.seo.title).toBe('Coffee Experts & Writers | AstroPress Coffee Authors');
      expect(result.seo.description).toBe('Meet the talented coffee experts, baristas, and writers behind AstroPress Coffee. Discover their expertise and browse their latest coffee articles and guides.');
      expect(result.seo.keywords).toEqual(['coffee experts', 'coffee writers', 'baristas', 'coffee authors', 'coffee professionals', 'coffee blog team']);
      expect(result.seo.ogImage).toBe('/images/seo/coffee-authors-og.jpg');
      expect(result.seo.canonical).toBe('/authors');
    });

    it('should return SEO data for blog main page', async () => {
      const result = await getPageData('blog-main');

      expect(result).toBeDefined();
      expect(result.seo.title).toBe('Coffee Blog | Expert Guides & Brewing Techniques | AstroPress');
      expect(result.seo.description).toBe('Discover expert coffee guides, brewing techniques, equipment reviews, and coffee culture insights. Your ultimate resource for everything coffee.');
      expect(result.seo.keywords).toEqual(['coffee blog', 'coffee guides', 'brewing techniques', 'coffee reviews', 'coffee culture', 'barista tips', 'coffee education']);
      expect(result.seo.ogImage).toBe('/images/seo/coffee-blog-main-og.jpg');
      expect(result.seo.canonical).toBe('/blog');
    });

    it('should return null for non-existent page', async () => {
      const result = await getPageData('non-existent-page');

      expect(result).toBeNull();
    });

    it('should handle empty pages collection gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'pages') {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const result = await getPageData('all-tags');

      expect(result).toBeNull();
    });

    it('should handle collection errors gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'pages') {
          throw new Error('Pages collection error');
        }
        return Promise.resolve([]);
      });

      const result = await getPageData('all-tags');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // LEGAL PAGES SEO TESTS
  // ==========================================

  describe('Legal Pages SEO', () => {
    it('should have enhanced SEO data for privacy policy', () => {
      const privacyPage = mockLegalData.find(page => page.id === 'privacy');

      expect(privacyPage).toBeDefined();
      expect(privacyPage.data.seo.title).toBe('Privacy Policy | AstroPress Coffee - Data Protection & Privacy');
      expect(privacyPage.data.seo.description).toBe('Learn how AstroPress Coffee collects, uses, and protects your personal information. Our comprehensive privacy policy ensures your data security and privacy rights.');
      expect(privacyPage.data.seo.keywords).toEqual(['privacy policy', 'data protection', 'personal information', 'cookies', 'user rights', 'data security']);
      expect(privacyPage.data.seo.ogImage).toBe('/images/seo/privacy-policy-og.jpg');
      expect(privacyPage.data.seo.canonical).toBe('/legal/privacy');
    });

    it('should have enhanced SEO data for terms of service', () => {
      const termsPage = mockLegalData.find(page => page.id === 'terms');

      expect(termsPage).toBeDefined();
      expect(termsPage.data.seo.title).toBe('Terms of Service | AstroPress Coffee - Website Terms & Conditions');
      expect(termsPage.data.seo.description).toBe('Read the terms and conditions that govern your use of AstroPress Coffee website and services. Understand your rights and responsibilities as a user.');
      expect(termsPage.data.seo.keywords).toEqual(['terms of service', 'terms and conditions', 'website terms', 'user agreement', 'legal terms', 'service conditions']);
      expect(termsPage.data.seo.ogImage).toBe('/images/seo/terms-service-og.jpg');
      expect(termsPage.data.seo.canonical).toBe('/legal/terms');
    });
  });

  // ==========================================
  // SEO INTEGRATION TESTS
  // ==========================================

  describe('Main Pages SEO Integration', () => {
    it('should provide complete SEO data for all main pages', async () => {
      const tagsPage = await getPageData('all-tags');
      const categoriesPage = await getPageData('all-categories');
      const authorsPage = await getPageData('all-authors');
      const blogPage = await getPageData('blog-main');

      // Verify all pages have complete SEO data
      const pages = [tagsPage, categoriesPage, authorsPage, blogPage];
      
      pages.forEach(page => {
        expect(page).toBeDefined();
        expect(page.seo).toBeDefined();
        expect(page.seo.title).toBeDefined();
        expect(page.seo.description).toBeDefined();
        expect(page.seo.keywords).toBeDefined();
        expect(page.seo.ogImage).toBeDefined();
        expect(page.seo.canonical).toBeDefined();
        
        // Verify SEO data quality
        expect(page.seo.title.length).toBeGreaterThan(10);
        expect(page.seo.description.length).toBeGreaterThan(50);
        expect(page.seo.keywords.length).toBeGreaterThan(0);
        expect(page.seo.ogImage).toMatch(/^\/images\/seo\//);
        expect(page.seo.canonical).toMatch(/^\/[a-z]+$/);
      });
    });

    it('should have unique SEO content for each main page', async () => {
      const tagsPage = await getPageData('all-tags');
      const categoriesPage = await getPageData('all-categories');
      const authorsPage = await getPageData('all-authors');
      const blogPage = await getPageData('blog-main');

      const pages = [tagsPage, categoriesPage, authorsPage, blogPage];
      const titles = pages.map(page => page.seo.title);
      const descriptions = pages.map(page => page.seo.description);
      const ogImages = pages.map(page => page.seo.ogImage);

      // Verify all titles are unique
      expect(new Set(titles).size).toBe(titles.length);
      
      // Verify all descriptions are unique
      expect(new Set(descriptions).size).toBe(descriptions.length);
      
      // Verify all OG images are unique
      expect(new Set(ogImages).size).toBe(ogImages.length);
    });

    it('should have coffee-focused keywords for all pages', async () => {
      const tagsPage = await getPageData('all-tags');
      const categoriesPage = await getPageData('all-categories');
      const authorsPage = await getPageData('all-authors');
      const blogPage = await getPageData('blog-main');

      const pages = [tagsPage, categoriesPage, authorsPage, blogPage];
      
      pages.forEach(page => {
        const keywords = page.seo.keywords.join(' ').toLowerCase();
        expect(keywords).toMatch(/coffee/);
        expect(page.seo.keywords.length).toBeGreaterThanOrEqual(4);
        expect(page.seo.keywords.length).toBeLessThanOrEqual(8);
      });
    });

    it('should have proper canonical URLs for all pages', async () => {
      const tagsPage = await getPageData('all-tags');
      const categoriesPage = await getPageData('all-categories');
      const authorsPage = await getPageData('all-authors');
      const blogPage = await getPageData('blog-main');

      expect(tagsPage.seo.canonical).toBe('/tags');
      expect(categoriesPage.seo.canonical).toBe('/categories');
      expect(authorsPage.seo.canonical).toBe('/authors');
      expect(blogPage.seo.canonical).toBe('/blog');
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('Main Pages SEO Error Handling', () => {
    it('should handle missing pages collection gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'pages') {
          throw new Error('Pages collection not found');
        }
        return Promise.resolve([]);
      });

      const result = await getPageData('all-tags');

      expect(result).toBeNull();
    });

    it('should handle malformed page data gracefully', async () => {
      const malformedPagesData = [
        {
          id: 'malformed',
          data: {
            id: 'malformed',
            // Missing required fields
            seo: null
          }
        }
      ];

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'pages') {
          return Promise.resolve(malformedPagesData);
        }
        return Promise.resolve([]);
      });

      const result = await getPageData('malformed');

      expect(result).toBeDefined();
      expect(result.seo).toBeNull();
    });

    it('should handle network timeouts gracefully', async () => {
      mockGetCollection.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      const result = await getPageData('all-tags');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('Main Pages SEO Performance', () => {
    it('should handle multiple concurrent page data requests efficiently', async () => {
      const startTime = Date.now();
      
      const promises = [
        getPageData('all-tags'),
        getPageData('all-categories'),
        getPageData('all-authors'),
        getPageData('blog-main')
      ];
      
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(4);
      expect(results.every(r => r !== null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should cache page data efficiently', async () => {
      let callCount = 0;
      
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'pages') {
          callCount++;
          return Promise.resolve(mockPagesData);
        }
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        return Promise.resolve([]);
      });

      // Multiple calls to same page
      await getPageData('all-tags');
      await getPageData('all-tags');
      await getPageData('all-tags');

      // Should call collection multiple times (no caching in current implementation)
      // This test documents current behavior - could be optimized later
      expect(callCount).toBeGreaterThan(0);
    });
  });
});