// src/core/__tests__/faq-parser.test.ts
// Comprehensive unit tests for FAQ parser utility

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseFAQFromContent, validateFAQData } from '../../utils/faqParser';
import type { FAQData, FAQItem } from '../../types/faq';

describe('FAQ Parser Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test data fixtures
  const validFAQContent = `
# Coffee Brewing Guide

This is a comprehensive guide to coffee brewing.

## FAQ Section

### Q1: What is the best coffee brewing method?
A1: The best brewing method depends on your taste preferences. Pour-over methods like V60 offer clean, bright flavors, while French press provides a fuller body with more oils and sediment.

### Q2: How should I store coffee beans?
A2: Store coffee beans in an airtight container in a cool, dark place. Avoid the refrigerator or freezer as moisture can damage the beans and affect flavor.

### Q3: What grind size should I use?
A3: Grind size depends on your brewing method: coarse for French press, medium for drip coffee, and fine for espresso. The extraction time determines the optimal grind size.

## Additional Content

More content here...
`;

  const faqWithTitle = `
# Coffee Guide

## Frequently Asked Questions (FAQ)

### Q: What is coffee?
A: Coffee is a brewed drink prepared from roasted coffee beans.

### Q: Where does coffee come from?
A: Coffee beans are the seeds of berries from certain Coffea species.
`;

  const faqWithoutNumbers = `
## FAQ

### Q: Simple question?
A: Simple answer.

### Q: Another question?
A: Another answer with more details and explanations.
`;

  const faqWithMarkdownLinks = `
## FAQ

### Q1: Where can I learn more?
A1: You can visit [our website](https://example.com) or check out [this guide](https://guide.com) for more information.

### Q2: What about [inline links](https://inline.com)?
A2: Links in questions work too, like [this one](https://test.com).
`;

  const invalidFAQContent = `
# No FAQ Here

This content has no FAQ section.

## Some Other Section

Just regular content without Q&A format.
`;

  const malformedFAQContent = `
## FAQ

### Q1: Valid question?
A1: Valid answer.

### Q2: Question without answer?

### Q3: 
A3: Answer without question.

### Not a question
Not an answer either.
`;

  // ==========================================
  // PARSE FAQ FROM CONTENT TESTS
  // ==========================================

  describe('parseFAQFromContent', () => {
    it('should parse valid FAQ content correctly', () => {
      const result = parseFAQFromContent(validFAQContent);

      expect(result).toBeDefined();
      expect(result!.title).toBe('FAQ Section');
      expect(result!.items).toHaveLength(3);

      // Check first FAQ item
      expect(result!.items[0].question).toBe('What is the best coffee brewing method?');
      expect(result!.items[0].answer).toContain('Pour-over methods like V60');
      expect(result!.items[0].answer).toContain('French press provides');

      // Check second FAQ item
      expect(result!.items[1].question).toBe('How should I store coffee beans?');
      expect(result!.items[1].answer).toContain('airtight container');
      expect(result!.items[1].answer).toContain('cool, dark place');

      // Check third FAQ item
      expect(result!.items[2].question).toBe('What grind size should I use?');
      expect(result!.items[2].answer).toContain('coarse for French press');
      expect(result!.items[2].answer).toContain('fine for espresso');
    });

    it('should parse FAQ with title in parentheses', () => {
      const result = parseFAQFromContent(faqWithTitle);

      expect(result).toBeDefined();
      expect(result!.title).toBe('Frequently Asked Questions');
      expect(result!.items).toHaveLength(2);

      expect(result!.items[0].question).toBe('What is coffee?');
      expect(result!.items[0].answer).toBe('Coffee is a brewed drink prepared from roasted coffee beans.');

      expect(result!.items[1].question).toBe('Where does coffee come from?');
      expect(result!.items[1].answer).toBe('Coffee beans are the seeds of berries from certain Coffea species.');
    });

    it('should parse FAQ without question numbers', () => {
      const result = parseFAQFromContent(faqWithoutNumbers);

      expect(result).toBeDefined();
      expect(result!.title).toBe('FAQ');
      expect(result!.items).toHaveLength(2);

      expect(result!.items[0].question).toBe('Simple question?');
      expect(result!.items[0].answer).toBe('Simple answer.');

      expect(result!.items[1].question).toBe('Another question?');
      expect(result!.items[1].answer).toBe('Another answer with more details and explanations.');
    });

    it('should strip markdown links from answers', () => {
      const result = parseFAQFromContent(faqWithMarkdownLinks);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);

      // Links in answers should be stripped
      expect(result!.items[0].answer).toBe('You can visit our website or check out this guide for more information.');
      expect(result!.items[0].answer).not.toContain('[');
      expect(result!.items[0].answer).not.toContain('](');

      // Links in questions should be stripped too
      expect(result!.items[1].question).toBe('What about inline links?');
      expect(result!.items[1].answer).toBe('Links in questions work too, like this one.');
    });

    it('should return null for content without FAQ section', () => {
      const result = parseFAQFromContent(invalidFAQContent);

      expect(result).toBeNull();
    });

    it('should return null for empty or invalid content', () => {
      expect(parseFAQFromContent('')).toBeNull();
      expect(parseFAQFromContent(null as any)).toBeNull();
      expect(parseFAQFromContent(undefined as any)).toBeNull();
      expect(parseFAQFromContent(123 as any)).toBeNull();
    });

    it('should handle malformed FAQ content gracefully', () => {
      const result = parseFAQFromContent(malformedFAQContent);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(1); // Only the valid Q&A pair

      expect(result!.items[0].question).toBe('Valid question?');
      expect(result!.items[0].answer).toBe('Valid answer.');
    });

    it('should handle different FAQ header formats', () => {
      const headerFormats = [
        '# FAQ',
        '## FAQ',
        '### FAQ',
        '#### FAQ',
        '##### FAQ',
        '###### FAQ',
        '## Frequently Asked Questions',
        '### FAQ Section',
        '# FAQ (Frequently Asked Questions)',
        '## Questions & Answers (FAQ)',
      ];

      headerFormats.forEach(header => {
        const content = `
${header}

### Q: Test question?
A: Test answer.
`;

        const result = parseFAQFromContent(content);
        expect(result).toBeDefined();
        expect(result!.items).toHaveLength(1);
        expect(result!.items[0].question).toBe('Test question?');
        expect(result!.items[0].answer).toBe('Test answer.');
      });
    });

    it('should handle FAQ with special characters', () => {
      const specialContent = `
## FAQ

### Q1: What's the "perfect" coffee temperature?
A1: The ideal brewing temperature is 195-205°F (90-96°C) for optimal extraction.

### Q2: How much does coffee cost per cup?
A2: Specialty coffee typically costs $0.50-$2.00 per cup, depending on quality & preparation method.
`;

      const result = parseFAQFromContent(specialContent);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);

      expect(result!.items[0].question).toBe('What\'s the "perfect" coffee temperature?');
      expect(result!.items[0].answer).toContain('195-205°F');
      expect(result!.items[0].answer).toContain('90-96°C');

      expect(result!.items[1].question).toBe('How much does coffee cost per cup?');
      expect(result!.items[1].answer).toContain('$0.50-$2.00');
      expect(result!.items[1].answer).toContain('&');
    });

    it('should handle FAQ with HTML in content', () => {
      const htmlContent = `
## FAQ

### Q1: How do I make <strong>bold</strong> coffee?
A1: Use a <em>higher</em> coffee-to-water ratio, like <code>1:15</code> instead of <code>1:17</code>.

### Q2: What about <a href="#">links</a>?
A2: HTML links should be preserved: <a href="https://example.com">Example</a>.
`;

      const result = parseFAQFromContent(htmlContent);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);

      // HTML should be preserved in questions and answers
      expect(result!.items[0].question).toContain('<strong>bold</strong>');
      expect(result!.items[0].answer).toContain('<em>higher</em>');
      expect(result!.items[0].answer).toContain('<code>1:15</code>');

      expect(result!.items[1].question).toContain('<a href="#">links</a>');
      expect(result!.items[1].answer).toContain('<a href="https://example.com">Example</a>');
    });

    it('should handle very long FAQ content', () => {
      const longAnswer = 'This is a very long answer that contains detailed information about coffee brewing. '.repeat(20);
      const longContent = `
## FAQ

### Q1: Tell me everything about coffee brewing?
A1: ${longAnswer}

### Q2: Short question?
A2: Short answer.
`;

      const result = parseFAQFromContent(longContent);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);

      expect(result!.items[0].answer.length).toBeGreaterThan(1000);
      expect(result!.items[0].answer).toContain('detailed information');

      expect(result!.items[1].answer).toBe('Short answer.');
    });

    it('should handle FAQ with multiple sections', () => {
      const multiSectionContent = `
# Guide

## First FAQ

### Q1: First section question?
A1: First section answer.

## Some Other Content

Regular content here.

## Another FAQ Section

### Q1: Second section question?
A1: Second section answer.

### Q2: Another question in second section?
A2: Another answer in second section.
`;

      const result = parseFAQFromContent(multiSectionContent);

      expect(result).toBeDefined();
      // Should find the first FAQ section
      expect(result!.title).toBe('First FAQ');
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0].question).toBe('First section question?');
    });

    it('should handle FAQ with inconsistent formatting', () => {
      const inconsistentContent = `
## FAQ

### Q1:What happens with no space after colon?
A1:Answer with no space.

###Q2: What about no space before question?
A2: Answer with space.

### Q3 : Extra spaces around colon?
A3 : Answer with extra spaces.

### Q4: Normal formatting?
A4: Normal answer.
`;

      const result = parseFAQFromContent(inconsistentContent);

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(4);

      expect(result!.items[0].question).toBe('What happens with no space after colon?');
      expect(result!.items[0].answer).toBe('Answer with no space.');

      expect(result!.items[1].question).toBe('What about no space before question?');
      expect(result!.items[1].answer).toBe('Answer with space.');

      expect(result!.items[2].question).toBe('Extra spaces around colon?');
      expect(result!.items[2].answer).toBe('Answer with extra spaces.');

      expect(result!.items[3].question).toBe('Normal formatting?');
      expect(result!.items[3].answer).toBe('Normal answer.');
    });
  });

  // ==========================================
  // VALIDATE FAQ DATA TESTS
  // ==========================================

  describe('validateFAQData', () => {
    it('should validate correct FAQ data', () => {
      const validData: FAQData = {
        title: 'Test FAQ',
        items: [
          {
            question: 'What is coffee?',
            answer: 'Coffee is a brewed drink.',
          },
          {
            question: 'How to brew coffee?',
            answer: 'Use hot water and coffee grounds.',
          },
        ],
      };

      expect(validateFAQData(validData)).toBe(true);
    });

    it('should validate FAQ data without title', () => {
      const validDataNoTitle: FAQData = {
        items: [
          {
            question: 'Test question?',
            answer: 'Test answer.',
          },
        ],
      };

      expect(validateFAQData(validDataNoTitle)).toBe(true);
    });

    it('should reject FAQ data with empty items array', () => {
      const emptyItemsData: FAQData = {
        title: 'Empty FAQ',
        items: [],
      };

      expect(validateFAQData(emptyItemsData)).toBe(false);
    });

    it('should reject FAQ data without items property', () => {
      const noItemsData = {
        title: 'No Items FAQ',
      } as FAQData;

      expect(validateFAQData(noItemsData)).toBe(false);
    });

    it('should reject FAQ data with non-array items', () => {
      const nonArrayItemsData = {
        title: 'Invalid Items',
        items: 'not an array',
      } as any;

      expect(validateFAQData(nonArrayItemsData)).toBe(false);
    });

    it('should reject FAQ data with invalid items', () => {
      const invalidItemsData: FAQData = {
        items: [
          {
            question: 'Valid question?',
            answer: 'Valid answer.',
          },
          {
            question: '', // Empty question
            answer: 'Answer without question.',
          },
          {
            question: 'Question without answer?',
            answer: '', // Empty answer
          },
          {
            question: null as any, // Null question
            answer: 'Answer with null question.',
          },
          {
            question: 'Question with null answer?',
            answer: null as any, // Null answer
          },
        ],
      };

      expect(validateFAQData(invalidItemsData)).toBe(false);
    });

    it('should reject FAQ data with non-string questions or answers', () => {
      const nonStringData: FAQData = {
        items: [
          {
            question: 123 as any, // Number instead of string
            answer: 'Valid answer.',
          },
          {
            question: 'Valid question?',
            answer: ['array', 'instead', 'of', 'string'] as any, // Array instead of string
          },
        ],
      };

      expect(validateFAQData(nonStringData)).toBe(false);
    });

    it('should reject FAQ data with whitespace-only questions or answers', () => {
      const whitespaceData: FAQData = {
        items: [
          {
            question: '   ', // Only whitespace
            answer: 'Valid answer.',
          },
          {
            question: 'Valid question?',
            answer: '\n\t  \n', // Only whitespace and newlines
          },
        ],
      };

      expect(validateFAQData(whitespaceData)).toBe(false);
    });

    it('should handle null or undefined FAQ data', () => {
      expect(validateFAQData(null as any)).toBe(false);
      expect(validateFAQData(undefined as any)).toBe(false);
    });

    it('should validate FAQ data with special characters', () => {
      const specialCharsData: FAQData = {
        items: [
          {
            question: 'What\'s the "perfect" temperature?',
            answer: 'The ideal temperature is 195-205°F (90-96°C).',
          },
          {
            question: 'How much does it cost?',
            answer: 'Typically $0.50-$2.00 per cup, depending on quality & method.',
          },
        ],
      };

      expect(validateFAQData(specialCharsData)).toBe(true);
    });

    it('should validate FAQ data with HTML content', () => {
      const htmlData: FAQData = {
        items: [
          {
            question: 'How do I make <strong>bold</strong> coffee?',
            answer: 'Use a <em>higher</em> ratio like <code>1:15</code>.',
          },
        ],
      };

      expect(validateFAQData(htmlData)).toBe(true);
    });

    it('should validate FAQ data with very long content', () => {
      const longContent = 'This is a very long answer. '.repeat(100);
      const longData: FAQData = {
        items: [
          {
            question: 'A very long question that goes on and on and provides lots of detail?',
            answer: longContent,
          },
        ],
      };

      expect(validateFAQData(longData)).toBe(true);
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('FAQ Parser Integration Tests', () => {
    it('should parse and validate FAQ content in one flow', () => {
      const content = `
## FAQ

### Q1: What is the best coffee?
A1: The best coffee is the one you enjoy most!

### Q2: How to store coffee beans?
A2: Store in an airtight container in a cool, dark place.
`;

      const parsedData = parseFAQFromContent(content);
      expect(parsedData).toBeDefined();

      const isValid = validateFAQData(parsedData!);
      expect(isValid).toBe(true);

      expect(parsedData!.items).toHaveLength(2);
      expect(parsedData!.items[0].question).toBe('What is the best coffee?');
      expect(parsedData!.items[1].question).toBe('How to store coffee beans?');
    });

    it('should handle edge cases in parsing and validation', () => {
      const edgeCaseContent = `
## FAQ

### Q1: 
A1: Answer without question text.

### Q2: Question without answer?

### Q3: Valid question?
A3: Valid answer.

### Not a proper format
Also not proper format.
`;

      const parsedData = parseFAQFromContent(edgeCaseContent);
      expect(parsedData).toBeDefined();

      // Should only parse the valid Q&A pair
      expect(parsedData!.items).toHaveLength(1);
      expect(parsedData!.items[0].question).toBe('Valid question?');
      expect(parsedData!.items[0].answer).toBe('Valid answer.');

      const isValid = validateFAQData(parsedData!);
      expect(isValid).toBe(true);
    });

    it('should work with real-world blog content', () => {
      const blogContent = `
# The Ultimate Guide to Coffee Brewing

Coffee brewing is an art and a science. In this comprehensive guide, we'll explore various methods and techniques.

## Introduction

Coffee has been enjoyed for centuries...

## Brewing Methods

There are many ways to brew coffee...

## FAQ

### Q1: What's the difference between espresso and drip coffee?
A1: Espresso is made by forcing hot water through finely ground coffee under pressure, resulting in a concentrated shot. Drip coffee uses gravity to slowly extract flavors from coarser grounds.

### Q2: How long should I brew my coffee?
A2: Brewing time varies by method: espresso takes 25-30 seconds, pour-over takes 3-4 minutes, and French press takes 4 minutes.

### Q3: What's the ideal water temperature?
A3: The optimal brewing temperature is between 195-205°F (90-96°C). Water that's too hot will over-extract and create bitter flavors.

## Conclusion

Great coffee starts with quality beans...
`;

      const parsedData = parseFAQFromContent(blogContent);
      expect(parsedData).toBeDefined();
      expect(parsedData!.title).toBe('FAQ');
      expect(parsedData!.items).toHaveLength(3);

      const isValid = validateFAQData(parsedData!);
      expect(isValid).toBe(true);

      // Check specific content
      expect(parsedData!.items[0].question).toContain('espresso and drip coffee');
      expect(parsedData!.items[0].answer).toContain('forcing hot water');

      expect(parsedData!.items[1].question).toContain('brew my coffee');
      expect(parsedData!.items[1].answer).toContain('25-30 seconds');

      expect(parsedData!.items[2].question).toContain('water temperature');
      expect(parsedData!.items[2].answer).toContain('195-205°F');
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  describe('FAQ Parser Performance Tests', () => {
    it('should handle large content efficiently', () => {
      // Generate large content with many FAQ items
      const largeFAQContent = `
## FAQ

${Array.from({ length: 100 }, (_, i) => `
### Q${i + 1}: What is question number ${i + 1}?
A${i + 1}: This is answer number ${i + 1}. It contains some detailed information about the topic.
`).join('')}
`;

      const startTime = performance.now();
      const result = parseFAQFromContent(largeFAQContent);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms

      // Validate the large dataset
      const isValid = validateFAQData(result!);
      expect(isValid).toBe(true);
    });

    it('should handle very long individual FAQ items efficiently', () => {
      const longQuestion = 'What is the answer to this very long question that goes on and on and provides lots of context and detail about the specific topic we are discussing? '.repeat(10);
      const longAnswer = 'This is a very detailed answer that provides comprehensive information about the topic. '.repeat(50);

      const longItemContent = `
## FAQ

### Q1: ${longQuestion}
A1: ${longAnswer}

### Q2: Short question?
A2: Short answer.
`;

      const startTime = performance.now();
      const result = parseFAQFromContent(longItemContent);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);
      expect(result!.items[0].question.length).toBeGreaterThan(1000);
      expect(result!.items[0].answer.length).toBeGreaterThan(2000);
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly

      const isValid = validateFAQData(result!);
      expect(isValid).toBe(true);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('FAQ Parser Error Handling', () => {
    it('should handle malformed regex patterns gracefully', () => {
      const malformedContent = `
## FAQ

### Q1: Question with [unclosed bracket?
A1: Answer with (unclosed parenthesis.

### Q2: Question with \\backslash?
A2: Answer with \\more\\backslashes.

### Q3: Question with *asterisks*?
A3: Answer with **bold** text.
`;

      expect(() => {
        const result = parseFAQFromContent(malformedContent);
        expect(result).toBeDefined();
        expect(result!.items).toHaveLength(3);
      }).not.toThrow();
    });

    it('should handle circular references in validation', () => {
      const circularData: any = {
        items: [
          {
            question: 'What is circular?',
            answer: 'This references itself.',
          },
        ],
      };

      // Create circular reference
      circularData.items[0].self = circularData;

      expect(() => {
        const isValid = validateFAQData(circularData);
        expect(typeof isValid).toBe('boolean');
      }).not.toThrow();
    });

    it('should handle extremely nested content', () => {
      const nestedContent = `
## FAQ

### Q1: What about nested content?
A1: This answer has nested content:

#### Subheading in answer
- List item 1
- List item 2

##### Even deeper nesting
More content here.

### Q2: Another question?
A2: Simple answer.
`;

      const result = parseFAQFromContent(nestedContent);
      expect(result).toBeDefined();
      expect(result!.items).toHaveLength(2);

      // First answer should include the nested content
      expect(result!.items[0].answer).toContain('nested content');
      expect(result!.items[0].answer).toContain('Subheading');
      expect(result!.items[0].answer).toContain('List item');
    });
  });
});