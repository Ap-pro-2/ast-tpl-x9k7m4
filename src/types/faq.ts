// FAQ Types for Schema Generation
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQData {
  title?: string;
  items: FAQItem[];
}

export interface FAQSchemaItem {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FAQSchemaItem[];
}