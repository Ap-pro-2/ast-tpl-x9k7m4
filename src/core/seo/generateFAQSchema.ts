import type { FAQData, FAQPageSchema, FAQSchemaItem } from '../../types/faq';

/**
 * Generate FAQ schema from parsed FAQ data
 */
export function generateFAQSchema(faqData: FAQData): FAQPageSchema | null {
  if (!faqData || !faqData.items || faqData.items.length === 0) {
    return null;
  }

  try {
    const mainEntity: FAQSchemaItem[] = faqData.items
      .filter(item => item && typeof item === 'object' && item.question && item.answer)
      .map(item => ({
        "@type": "Question",
        name: String(item.question),
        acceptedAnswer: {
          "@type": "Answer",
          text: String(item.answer)
        }
      }));

    if (mainEntity.length === 0) {
      return null;
    }

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity
    };
  } catch (error) {
    console.warn('Error generating FAQ schema:', error);
    return null;
  }
}

/**
 * Generate FAQ schema items for embedding in other schemas
 * Returns just the Question objects for use in combined schemas
 */
export function generateFAQSchemaItems(faqData: FAQData): FAQSchemaItem[] | null {
  if (!faqData || !faqData.items || faqData.items.length === 0) {
    return null;
  }

  try {
    const items = faqData.items
      .filter(item => item && typeof item === 'object' && item.question && item.answer)
      .map(item => ({
        "@type": "Question",
        name: String(item.question),
        acceptedAnswer: {
          "@type": "Answer",
          text: String(item.answer)
        }
      }));

    return items.length > 0 ? items : null;
  } catch (error) {
    console.warn('Error generating FAQ schema items:', error);
    return null;
  }
}