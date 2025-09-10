import type { FAQData, FAQPageSchema, FAQSchemaItem } from '../../types/faq';


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
    return null;
  }
}


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
    return null;
  }
}