// src/core/__tests__/faq-schema.test.ts
// Comprehensive unit tests for FAQ schema generation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateFAQSchema, generateFAQSchemaItems } from '../seo/generateFAQSchema';
import type { FAQData } from '../../types/faq';

describe('FAQ Schema Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test data fixtures
  const mockFAQData: FAQData = {
    items: [
      {
        question: 'What is the best coffee brewing method?',
        answer: 'The best brewing method depends on your taste preferences. Pour-over methods like V60 offer clean, bright flavors, while French press provides a fuller body.'
      },
      {
        question: 'How should I store coffee beans?',
        answer: 'Store coffee beans in an airtight container in a cool, dark place. Avoid the refrigerator or freezer as moisture can damage the beans.'
      },
      {
        question: 'What grind size should I use?',
        answer: 'Grind size depends on your brewing method: coarse for French press, medium for drip coffee, and fine for espresso.'
      }
    ]
  };

  const emptyFAQData: FAQData = {
    items: []
  };

  // ==========================================
  // GENERATE FAQ SCHEMA TESTS
  // ==========================================

  describe('generateFAQSchema', () => {
    it('should generate valid FAQPage schema with all questions', () => {
      const result = generateFAQSchema(mockFAQData);

      expect(result).toBeDefined();
      expect(result!['@context']).toBe('https://schema.org');
      expect(result!['@type']).toBe('FAQPage');
      expect(result!.mainEntity).toHaveLength(3);

      // Check first question
      const firstQuestion = result!.mainEntity[0];
      expect(firstQuestion['@type']).toBe('Question');
      expect(firstQuestion.name).toBe('What is the best coffee brewing method?');
      expect(firstQuestion.acceptedAnswer).toBeDefined();
      expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer');
      expect(firstQuestion.acceptedAnswer.text).toContain('Pour-over methods');

      // Check second question
      const secondQuestion = result!.mainEntity[1];
      expect(secondQuestion['@type']).toBe('Question');
      expect(secondQuestion.name).toBe('How should I store coffee beans?');
      expect(secondQuestion.acceptedAnswer.text).toContain('airtight container');

      // Check third question
      const thirdQuestion = result!.mainEntity[2];
      expect(thirdQuestion['@type']).toBe('Question');
      expect(thirdQuestion.name).toBe('What grind size should I use?');
      expect(thirdQuestion.acceptedAnswer.text).toContain('coarse for French press');
    });

    it('should return null for empty FAQ data', () => {
      const result = generateFAQSchema(emptyFAQData);

      expect(result).toBeNull();
    });

    it('should return null for null FAQ data', () => {
      const result = generateFAQSchema(null as any);

      expect(result).toBeNull();
    });

    it('should return null for undefined FAQ data', () => {
      const result = generateFAQSchema(undefined as any);

      expect(result).toBeNull();
    });

    it('should return null for FAQ data without items', () => {
      const invalidFAQData = {} as FAQData;
      const result = generateFAQSchema(invalidFAQData);

      expect(result).toBeNull();
    });

    it('should handle single FAQ item', () => {
      const singleFAQData: FAQData = {
        items: [
          {
            question: 'What is coffee?',
            answer: 'Coffee is a brewed drink prepared from roasted coffee beans.'
          }
        ]
      };

      const result = generateFAQSchema(singleFAQData);

      expect(result).toBeDefined();
      expect(result!.mainEntity).toHaveLength(1);
      expect(result!.mainEntity[0].name).toBe('What is coffee?');
      expect(result!.mainEntity[0].acceptedAnswer.text).toBe('Coffee is a brewed drink prepared from roasted coffee beans.');
    });

    it('should handle FAQ items with special characters', () => {
      const specialCharFAQData: FAQData = {
        items: [
          {
            question: 'What\'s the "perfect" coffee temperature?',
            answer: 'The ideal brewing temperature is 195-205°F (90-96°C) for optimal extraction.'
          }
        ]
      };

      const result = generateFAQSchema(specialCharFAQData);

      expect(result).toBeDefined();
      expect(result!.mainEntity[0].name).toBe('What\'s the "perfect" coffee temperature?');
      expect(result!.mainEntity[0].acceptedAnswer.text).toContain('195-205°F');
    });

    it('should handle FAQ items with HTML in answers', () => {
      const htmlFAQData: FAQData = {
        items: [
          {
            question: 'How do I make espresso?',
            answer: 'Use <strong>finely ground coffee</strong> and extract for <em>25-30 seconds</em> at 9 bars of pressure.'
          }
        ]
      };

      const result = generateFAQSchema(htmlFAQData);

      expect(result).toBeDefined();
      expect(result!.mainEntity[0].acceptedAnswer.text).toContain('<strong>finely ground coffee</strong>');
      expect(result!.mainEntity[0].acceptedAnswer.text).toContain('<em>25-30 seconds</em>');
    });

    it('should handle very long FAQ answers', () => {
      const longAnswer = 'This is a very long answer that contains detailed information about coffee brewing. '.repeat(10);
      const longFAQData: FAQData = {
        items: [
          {
            question: 'Tell me everything about coffee?',
            answer: longAnswer
          }
        ]
      };

      const result = generateFAQSchema(longFAQData);

      expect(result).toBeDefined();
      expect(result!.mainEntity[0].acceptedAnswer.text).toBe(longAnswer);
      expect(result!.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(500);
    });
  });

  // ==========================================
  // GENERATE FAQ SCHEMA ITEMS TESTS
  // ==========================================

  describe('generateFAQSchemaItems', () => {
    it('should generate FAQ schema items for embedding', () => {
      const result = generateFAQSchemaItems(mockFAQData);

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);

      // Check that items are Question objects without @context
      result!.forEach(item => {
        expect(item['@type']).toBe('Question');
        expect(item.name).toBeDefined();
        expect(item.acceptedAnswer).toBeDefined();
        expect(item.acceptedAnswer['@type']).toBe('Answer');
        expect(item.acceptedAnswer.text).toBeDefined();
        expect(item['@context']).toBeUndefined(); // Should not have context for embedding
      });

      // Check specific items
      expect(result![0].name).toBe('What is the best coffee brewing method?');
      expect(result![1].name).toBe('How should I store coffee beans?');
      expect(result![2].name).toBe('What grind size should I use?');
    });

    it('should return null for empty FAQ data', () => {
      const result = generateFAQSchemaItems(emptyFAQData);

      expect(result).toBeNull();
    });

    it('should return null for null FAQ data', () => {
      const result = generateFAQSchemaItems(null as any);

      expect(result).toBeNull();
    });

    it('should return null for undefined FAQ data', () => {
      const result = generateFAQSchemaItems(undefined as any);

      expect(result).toBeNull();
    });

    it('should handle single FAQ item for embedding', () => {
      const singleFAQData: FAQData = {
        items: [
          {
            question: 'What is the best coffee?',
            answer: 'The best coffee is the one you enjoy most!'
          }
        ]
      };

      const result = generateFAQSchemaItems(singleFAQData);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result![0]['@type']).toBe('Question');
      expect(result![0].name).toBe('What is the best coffee?');
      expect(result![0].acceptedAnswer.text).toBe('The best coffee is the one you enjoy most!');
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('FAQ Schema Integration Tests', () => {
    it('should work with both full schema and items generation', () => {
      const fullSchema = generateFAQSchema(mockFAQData);
      const schemaItems = generateFAQSchemaItems(mockFAQData);

      expect(fullSchema).toBeDefined();
      expect(schemaItems).toBeDefined();

      // Full schema should have context and type
      expect(fullSchema!['@context']).toBe('https://schema.org');
      expect(fullSchema!['@type']).toBe('FAQPage');

      // Items should not have context (for embedding)
      expect(schemaItems![0]['@context']).toBeUndefined();

      // Both should have the same questions
      expect(fullSchema!.mainEntity).toHaveLength(schemaItems!.length);
      
      fullSchema!.mainEntity.forEach((item, index) => {
        expect(item.name).toBe(schemaItems![index].name);
        expect(item.acceptedAnswer.text).toBe(schemaItems![index].acceptedAnswer.text);
      });
    });

    it('should handle mixed valid and edge case data', () => {
      const mixedFAQData: FAQData = {
        items: [
          {
            question: 'Normal question?',
            answer: 'Normal answer.'
          },
          {
            question: '',
            answer: 'Answer without question.'
          },
          {
            question: 'Question without answer?',
            answer: ''
          },
          {
            question: 'What about "quotes" and special chars?',
            answer: 'They should work fine! Even with émojis ☕'
          }
        ]
      };

      const fullSchema = generateFAQSchema(mixedFAQData);
      const schemaItems = generateFAQSchemaItems(mixedFAQData);

      expect(fullSchema).toBeDefined();
      expect(schemaItems).toBeDefined();
      expect(fullSchema!.mainEntity).toHaveLength(4);
      expect(schemaItems).toHaveLength(4);

      // Check that empty strings are preserved
      expect(fullSchema!.mainEntity[1].name).toBe('');
      expect(fullSchema!.mainEntity[2].acceptedAnswer.text).toBe('');

      // Check special characters are preserved
      expect(fullSchema!.mainEntity[3].name).toContain('"quotes"');
      expect(fullSchema!.mainEntity[3].acceptedAnswer.text).toContain('☕');
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('FAQ Schema Performance Tests', () => {
    it('should handle large FAQ datasets efficiently', () => {
      // Generate large FAQ dataset
      const largeFAQData: FAQData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          question: `Question ${i + 1}: What about topic ${i + 1}?`,
          answer: `Answer ${i + 1}: This is a detailed answer about topic ${i + 1}. `.repeat(5)
        }))
      };

      const startTime = performance.now();
      const result = generateFAQSchema(largeFAQData);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result!.mainEntity).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms

      // Check first and last items
      expect(result!.mainEntity[0].name).toBe('Question 1: What about topic 1?');
      expect(result!.mainEntity[99].name).toBe('Question 100: What about topic 100?');
    });

    it('should handle FAQ items generation efficiently', () => {
      const largeFAQData: FAQData = {
        items: Array.from({ length: 50 }, (_, i) => ({
          question: `Embedded question ${i + 1}?`,
          answer: `Embedded answer ${i + 1}.`
        }))
      };

      const startTime = performance.now();
      const result = generateFAQSchemaItems(largeFAQData);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('FAQ Schema Error Handling', () => {
    it('should handle malformed FAQ data gracefully', () => {
      const malformedFAQData = {
        items: [
          null,
          undefined,
          { question: 'Valid question?', answer: 'Valid answer.' },
          { question: null, answer: 'Answer with null question.' },
          { question: 'Question with null answer?', answer: null },
          'invalid item',
          123,
          {}
        ]
      } as any;

      // Should not throw errors
      expect(() => {
        const fullSchema = generateFAQSchema(malformedFAQData);
        const schemaItems = generateFAQSchemaItems(malformedFAQData);
        
        // Should still process valid items
        expect(fullSchema).toBeDefined();
        expect(schemaItems).toBeDefined();
      }).not.toThrow();
    });

    it('should handle circular references gracefully', () => {
      const circularFAQData: any = {
        items: [
          {
            question: 'What is circular?',
            answer: 'This references itself.'
          }
        ]
      };
      
      // Create circular reference
      circularFAQData.items[0].self = circularFAQData;

      // Should not throw errors or cause infinite loops
      expect(() => {
        const result = generateFAQSchema(circularFAQData);
        expect(result).toBeDefined();
        expect(result!.mainEntity).toHaveLength(1);
      }).not.toThrow();
    });

    it('should handle extremely large strings gracefully', () => {
      const hugeFAQData: FAQData = {
        items: [
          {
            question: 'A'.repeat(10000), // Very long question
            answer: 'B'.repeat(50000)    // Very long answer
          }
        ]
      };

      expect(() => {
        const result = generateFAQSchema(hugeFAQData);
        expect(result).toBeDefined();
        expect(result!.mainEntity[0].name).toHaveLength(10000);
        expect(result!.mainEntity[0].acceptedAnswer.text).toHaveLength(50000);
      }).not.toThrow();
    });
  });

  // ==========================================
  // SCHEMA VALIDATION TESTS
  // ==========================================

  describe('FAQ Schema Validation Tests', () => {
    it('should generate schema that matches Schema.org FAQPage specification', () => {
      const result = generateFAQSchema(mockFAQData);

      expect(result).toBeDefined();
      
      // Check required FAQPage properties
      expect(result!['@context']).toBe('https://schema.org');
      expect(result!['@type']).toBe('FAQPage');
      expect(result!.mainEntity).toBeDefined();
      expect(Array.isArray(result!.mainEntity)).toBe(true);

      // Check each Question in mainEntity
      result!.mainEntity.forEach(question => {
        expect(question['@type']).toBe('Question');
        expect(typeof question.name).toBe('string');
        expect(question.acceptedAnswer).toBeDefined();
        expect(question.acceptedAnswer['@type']).toBe('Answer');
        expect(typeof question.acceptedAnswer.text).toBe('string');
      });
    });

    it('should generate schema items that match Schema.org Question specification', () => {
      const result = generateFAQSchemaItems(mockFAQData);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Check each Question item
      result!.forEach(question => {
        expect(question['@type']).toBe('Question');
        expect(typeof question.name).toBe('string');
        expect(question.acceptedAnswer).toBeDefined();
        expect(question.acceptedAnswer['@type']).toBe('Answer');
        expect(typeof question.acceptedAnswer.text).toBe('string');
        
        // Should not have @context for embedding
        expect(question['@context']).toBeUndefined();
      });
    });

    it('should preserve exact text content without modification', () => {
      const preservationFAQData: FAQData = {
        items: [
          {
            question: 'Original question with "quotes" and symbols: @#$%',
            answer: 'Original answer with <tags>, newlines\nand\ttabs, plus émojis ☕🚀'
          }
        ]
      };

      const result = generateFAQSchema(preservationFAQData);

      expect(result).toBeDefined();
      expect(result!.mainEntity[0].name).toBe('Original question with "quotes" and symbols: @#$%');
      expect(result!.mainEntity[0].acceptedAnswer.text).toBe('Original answer with <tags>, newlines\nand\ttabs, plus émojis ☕🚀');
    });
  });
});