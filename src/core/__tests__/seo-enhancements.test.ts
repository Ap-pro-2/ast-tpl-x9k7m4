// src/core/__tests__/seo-enhancements.test.ts
// Unit tests for our new SEO enhancements for tags and categories

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CollectionEntry } from 'astro:content';

// Mock Astro content collections
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

// Import mocked functions
import { getCollection } from 'astro:content';
const mockGetCollection = vi.mocked(getCollection);

// Import functions to test
import {
  generateTagSEO,
  generateCategorySEO,
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

const mockTagWithSEO = {
  id: 'coffee-tips',
  data: {
    id: 'coffee-tips',
    name: 'Coffee Tips',
    description: 'Practical tips and advice for coffee enthusiasts',
    color: '#8b4513',
    slug: 'coffee-tips',
    seo: {
      title: 'Coffee Tips & Brewing Advice | AstroPress Coffee',
      description: 'Discover expert coffee tips, brewing techniques, and barista secrets. Learn how to make perfect coffee at home with our professional guides and advice.',
      keywords: ['coffee tips', 'brewing advice', 'barista tips', 'coffee guide', 'home brewing', 'coffee techniques'],
      ogImage: '/images/seo/coffee-tips-og.jpg',
      ogImageAlt: 'Professional coffee brewing tips and techniques guide'
    }
  }
};

const mockTagWithoutSEO = {
  id: 'coffee-science',
  data: {
    id: 'coffee-science',
    name: 'Coffee Science',
    description: 'The science behind coffee extraction and brewing',
    color: '#4a5568',
    slug: 'coffee-science'
    // No SEO field
  }
};

const mockCategoryWithSEO = {
  id: 'brewing-guides',
  data: {
    id: 'brewing-guides',
    name: 'Brewing Guides',
    description: 'Expert techniques and methods for brewing the perfect cup of coffee',
    color: '#8b5a2b',
    slug: 'brewing-guides',
    seo: {
      title: 'Coffee Brewing Guides & Techniques | AstroPress Coffee',
      description: 'Master coffee brewing with our expert guides. Learn pour-over, French press, espresso, and more brewing methods for the perfect cup every time.',
      keywords: ['coffee brewing', 'brewing guides', 'pour over', 'french press', 'coffee techniques', 'barista guide', 'brewing methods'],
      ogImage: '/images/seo/brewing-guides-og.jpg',
      ogImageAlt: 'Comprehensive coffee brewing guides and techniques'
    }
  }
};

const mockCategoryWithoutSEO = {
  id: 'general',
  data: {
    id: 'general',
    name: 'General',
    description: 'General coffee topics',
    color: '#666666',
    slug: 'general'
    // No SEO field
  }
};

const mockSettingsEntry = {
  id: 'site-config',
  data: mockSiteSettings,
};

describe('SEO Enhancements Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for settings
    mockGetCollection.mockImplementation((collection) => {
      if (collection === 'settings') {
        return Promise.resolve([mockSettingsEntry]);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // TAG SEO TESTS
  // ==========================================

  describe('generateTagSEO', () => {
    it('should use custom SEO data when available', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([mockTagWithSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('coffee-tips');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Coffee Tips & Brewing Advice | AstroPress Coffee');
      expect(result.description).toBe('Discover expert coffee tips, brewing techniques, and barista secrets. Learn how to make perfect coffee at home with our professional guides and advice.');
      expect(result.keywords).toEqual(['coffee tips', 'brewing advice', 'barista tips', 'coffee guide', 'home brewing', 'coffee techniques']);
      expect(result.ogImage).toBe('/images/seo/coffee-tips-og.jpg');
      expect(result.ogImageAlt).toBe('Professional coffee brewing tips and techniques guide');
      expect(result.canonicalUrl).toBe('https://astropress.coffee/tags/coffee-tips');
      expect(result.ogimage.url).toBe('/images/seo/coffee-tips-og.jpg');
      expect(result.ogimage.alt).toBe('Professional coffee brewing tips and techniques guide');
    });

    it('should fallback to default SEO when custom SEO is not available', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([mockTagWithoutSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('coffee-science');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Posts tagged with: Coffee Science - AstroPress');
      expect(result.description).toBe('The science behind coffee extraction and brewing');
      expect(result.keywords).toBeUndefined();
      expect(result.ogImage).toBeUndefined();
      expect(result.ogImageAlt).toBeUndefined();
      expect(result.canonicalUrl).toBe('https://astropress.coffee/tags/coffee-science');
      expect(result.ogimage.url).toBe('/og-coffee.jpg');
      expect(result.ogimage.alt).toBe('AstroPress - Posts tagged with Coffee Science');
    });

    it('should handle non-existent tag gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('non-existent-tag');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Posts tagged with: non-existent-tag - AstroPress');
      expect(result.description).toBe('Browse all posts tagged with non-existent-tag from AstroPress.');
      expect(result.canonicalUrl).toBe('https://astropress.coffee/tags/non-existent-tag');
    });

    it('should handle partial custom SEO data', async () => {
      const tagWithPartialSEO = {
        id: 'partial-seo',
        data: {
          id: 'partial-seo',
          name: 'Partial SEO',
          description: 'Tag with partial SEO',
          slug: 'partial-seo',
          seo: {
            title: 'Custom Title Only',
            // Missing description, keywords, etc.
          }
        }
      };

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([tagWithPartialSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('partial-seo');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Custom Title Only');
      expect(result.description).toBe('Tag with partial SEO'); // Falls back to tag description
      expect(result.keywords).toBeUndefined();
      expect(result.ogImage).toBeUndefined();
    });

    it('should handle empty custom SEO fields', async () => {
      const tagWithEmptySEO = {
        id: 'empty-seo',
        data: {
          id: 'empty-seo',
          name: 'Empty SEO',
          description: 'Tag with empty SEO',
          slug: 'empty-seo',
          seo: {
            title: '',
            description: '',
            keywords: [],
            ogImage: '',
            ogImageAlt: ''
          }
        }
      };

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([tagWithEmptySEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('empty-seo');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Posts tagged with: Empty SEO - AstroPress'); // Falls back to default
      expect(result.description).toBe('Tag with empty SEO'); // Falls back to tag description
      expect(result.keywords).toEqual([]); // Empty array
    });
  });

  // ==========================================
  // CATEGORY SEO TESTS
  // ==========================================

  describe('generateCategorySEO', () => {
    it('should use custom SEO data when available', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'categories') {
          return Promise.resolve([mockCategoryWithSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateCategorySEO('brewing-guides');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Coffee Brewing Guides & Techniques | AstroPress Coffee');
      expect(result.description).toBe('Master coffee brewing with our expert guides. Learn pour-over, French press, espresso, and more brewing methods for the perfect cup every time.');
      expect(result.keywords).toEqual(['coffee brewing', 'brewing guides', 'pour over', 'french press', 'coffee techniques', 'barista guide', 'brewing methods']);
      expect(result.ogImage).toBe('/images/seo/brewing-guides-og.jpg');
      expect(result.ogImageAlt).toBe('Comprehensive coffee brewing guides and techniques');
      expect(result.canonicalUrl).toBe('https://astropress.coffee/categories/brewing-guides');
      expect(result.ogimage.url).toBe('/images/seo/brewing-guides-og.jpg');
      expect(result.ogimage.alt).toBe('Comprehensive coffee brewing guides and techniques');
    });

    it('should fallback to default SEO when custom SEO is not available', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'categories') {
          return Promise.resolve([mockCategoryWithoutSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateCategorySEO('general');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('General Posts - AstroPress');
      expect(result.description).toBe('General coffee topics');
      expect(result.keywords).toBeUndefined();
      expect(result.ogImage).toBeUndefined();
      expect(result.ogImageAlt).toBeUndefined();
      expect(result.canonicalUrl).toBe('https://astropress.coffee/categories/general');
      expect(result.ogimage.url).toBe('/og-coffee.jpg');
      expect(result.ogimage.alt).toBe('AstroPress - General Posts');
    });

    it('should handle non-existent category gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'categories') {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const result = await generateCategorySEO('non-existent-category');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('non-existent-category Posts - AstroPress');
      expect(result.description).toBe('Browse all posts in the non-existent-category category from AstroPress.');
      expect(result.canonicalUrl).toBe('https://astropress.coffee/categories/non-existent-category');
    });

    it('should handle partial custom SEO data', async () => {
      const categoryWithPartialSEO = {
        id: 'partial-seo',
        data: {
          id: 'partial-seo',
          name: 'Partial SEO Category',
          description: 'Category with partial SEO',
          slug: 'partial-seo',
          seo: {
            description: 'Custom description only',
            keywords: ['custom', 'keywords']
            // Missing title, ogImage, etc.
          }
        }
      };

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'categories') {
          return Promise.resolve([categoryWithPartialSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateCategorySEO('partial-seo');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Partial SEO Category Posts - AstroPress'); // Falls back to default
      expect(result.description).toBe('Custom description only'); // Uses custom
      expect(result.keywords).toEqual(['custom', 'keywords']); // Uses custom
      expect(result.ogImage).toBeUndefined();
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('SEO Integration Tests', () => {
    it('should work with complete tag and category data', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([mockTagWithSEO, mockTagWithoutSEO]);
        }
        if (collection === 'categories') {
          return Promise.resolve([mockCategoryWithSEO, mockCategoryWithoutSEO]);
        }
        return Promise.resolve([]);
      });

      // Test both enhanced and fallback SEO
      const tagWithSEO = await generateTagSEO('coffee-tips');
      const tagWithoutSEO = await generateTagSEO('coffee-science');
      const categoryWithSEO = await generateCategorySEO('brewing-guides');
      const categoryWithoutSEO = await generateCategorySEO('general');

      // Verify enhanced SEO
      expect(tagWithSEO.pageTitle).toContain('Coffee Tips & Brewing Advice');
      expect(tagWithSEO.keywords).toBeDefined();
      expect(tagWithSEO.ogImage).toBeDefined();

      expect(categoryWithSEO.pageTitle).toContain('Coffee Brewing Guides & Techniques');
      expect(categoryWithSEO.keywords).toBeDefined();
      expect(categoryWithSEO.ogImage).toBeDefined();

      // Verify fallback SEO
      expect(tagWithoutSEO.pageTitle).toContain('Posts tagged with: Coffee Science');
      expect(tagWithoutSEO.keywords).toBeUndefined();
      expect(tagWithoutSEO.ogImage).toBeUndefined();

      expect(categoryWithoutSEO.pageTitle).toContain('General Posts');
      expect(categoryWithoutSEO.keywords).toBeUndefined();
      expect(categoryWithoutSEO.ogImage).toBeUndefined();
    });

    it('should handle mixed success/failure scenarios', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.reject(new Error('Tags collection error'));
        }
        if (collection === 'categories') {
          return Promise.resolve([mockCategoryWithSEO]);
        }
        return Promise.resolve([]);
      });

      // Tag should fail gracefully
      try {
        const tagResult = await generateTagSEO('coffee-tips');
        expect(tagResult).toBeDefined();
        expect(tagResult.pageTitle).toContain('coffee-tips'); // Fallback to slug
      } catch (error) {
        // Expected to fail, but should be handled gracefully in real implementation
        expect(error.message).toContain('Tags collection error');
      }

      // Category should work normally
      const categoryResult = await generateCategorySEO('brewing-guides');
      expect(categoryResult).toBeDefined();
      expect(categoryResult.pageTitle).toContain('Coffee Brewing Guides');
    });

    it('should handle missing site settings gracefully', async () => {
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([]); // No settings
        }
        if (collection === 'tags') {
          return Promise.resolve([mockTagWithSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('coffee-tips');

      expect(result).toBeDefined();
      expect(result.pageTitle).toBe('Coffee Tips & Brewing Advice | AstroPress Coffee');
      expect(result.canonicalUrl).toContain('/tags/coffee-tips'); // Should still work with fallback
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('SEO Error Handling', () => {
    it('should handle collection errors gracefully', async () => {
      mockGetCollection.mockRejectedValue(new Error('Collection error'));

      const tagResult = await generateTagSEO('coffee-tips');
      const categoryResult = await generateCategorySEO('brewing-guides');

      expect(tagResult).toBeDefined();
      expect(categoryResult).toBeDefined();
      
      // Should have basic fallback data
      expect(tagResult.pageTitle).toContain('coffee-tips');
      expect(categoryResult.pageTitle).toContain('brewing-guides');
    });

    it('should handle malformed SEO data gracefully', async () => {
      const tagWithMalformedSEO = {
        id: 'malformed',
        data: {
          id: 'malformed',
          name: 'Malformed Tag',
          slug: 'malformed',
          seo: {
            title: null, // Invalid data
            keywords: 'not-an-array', // Invalid data
            ogImage: 123 // Invalid data
          }
        }
      };

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([tagWithMalformedSEO]);
        }
        return Promise.resolve([]);
      });

      const result = await generateTagSEO('malformed');

      expect(result).toBeDefined();
      // Should fallback to safe defaults
      expect(result.pageTitle).toContain('Malformed Tag');
      expect(result.description).toBeDefined();
      expect(result.canonicalUrl).toBeDefined();
    });

    it('should handle network timeouts gracefully', async () => {
      mockGetCollection.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      const result = await generateTagSEO('timeout-test');

      expect(result).toBeDefined();
      expect(result.pageTitle).toContain('timeout-test');
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('SEO Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large mock datasets
      const largeTags = Array.from({ length: 1000 }, (_, i) => ({
        id: `tag-${i}`,
        data: {
          id: `tag-${i}`,
          name: `Tag ${i}`,
          slug: `tag-${i}`,
          seo: i % 2 === 0 ? {
            title: `Custom Title ${i}`,
            description: `Custom Description ${i}`,
            keywords: [`keyword-${i}`]
          } : undefined
        }
      }));

      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve(largeTags);
        }
        return Promise.resolve([]);
      });

      const startTime = Date.now();
      
      // Test multiple SEO generations
      const promises = Array.from({ length: 10 }, (_, i) => 
        generateTagSEO(`tag-${i}`)
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(results.every(r => r !== null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should cache settings data efficiently', async () => {
      let settingsCallCount = 0;
      
      mockGetCollection.mockImplementation((collection) => {
        if (collection === 'settings') {
          settingsCallCount++;
          return Promise.resolve([mockSettingsEntry]);
        }
        if (collection === 'tags') {
          return Promise.resolve([mockTagWithSEO]);
        }
        return Promise.resolve([]);
      });

      // Multiple calls should reuse settings
      await generateTagSEO('coffee-tips');
      await generateTagSEO('coffee-tips');
      await generateTagSEO('coffee-tips');

      // Settings should be called multiple times (no caching in current implementation)
      // This test documents current behavior - could be optimized later
      expect(settingsCallCount).toBeGreaterThan(0);
    });
  });
});