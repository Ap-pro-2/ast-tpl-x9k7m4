import type { FAQData, FAQItem } from '../types/faq';

/**
 * Parses MDX content to extract FAQ sections
 * Supports patterns like:
 * ## FAQ Section
 * ### Q1: Question text?
 * A1: Answer text...
 */
export function parseFAQFromContent(content: string): FAQData | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Look for FAQ section headers
  const faqSectionRegex = /#{1,6}\s*.*(?:FAQ|Frequently Asked Questions).*$/gim;
  const faqSectionMatch = content.match(faqSectionRegex);
  
  if (!faqSectionMatch) {
    return null;
  }

  // Extract FAQ title from the header
  const faqTitle = faqSectionMatch[0]
    .replace(/#{1,6}\s*/, '')
    .replace(/\(FAQ\)/gi, '')
    .trim();

  // Find the FAQ section content - only process the first FAQ section
  const faqSectionIndex = content.indexOf(faqSectionMatch[0]);
  let faqContent = content.substring(faqSectionIndex);
  
  // Find the end of this FAQ section (next major heading)
  const nextSectionRegex = /\n#{1,6}\s*(?!###)[^#\n]*$/gm;
  const nextSectionMatch = nextSectionRegex.exec(faqContent);
  if (nextSectionMatch && nextSectionMatch.index > 0) {
    faqContent = faqContent.substring(0, nextSectionMatch.index);
  }

  // Parse Q&A pairs with flexible patterns
  const qaRegex = /###\s*Q\d*:?\s*(.+?)\n+A\d*:?\s*(.+?)(?=\n###|\n\n(?![A]\d*:)|$)/gis;
  const matches = Array.from(faqContent.matchAll(qaRegex));

  if (matches.length === 0) {
    return null;
  }

  const items: FAQItem[] = matches.map(match => {
    const question = stripMarkdownLinks(cleanText(match[1]));
    const answer = stripMarkdownLinks(cleanText(match[2]));
    
    return {
      question,
      answer
    };
  }).filter(item => 
    item.question.trim().length > 0 && 
    item.answer.trim().length > 0
  );

  return {
    title: faqTitle,
    items
  };
}

/**
 * Clean text by removing extra whitespace and formatting
 */
function cleanText(text: string): string {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*:\s*/, '') // Remove leading colon and spaces
    .trim();
}

/**
 * Strip markdown links but keep the link text
 * [Link Text](url) -> Link Text
 */
function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

/**
 * Validate FAQ data structure
 */
export function validateFAQData(faqData: FAQData): boolean {
  if (!faqData || !faqData.items || !Array.isArray(faqData.items)) {
    return false;
  }

  // Reject empty items arrays
  if (faqData.items.length === 0) {
    return false;
  }

  return faqData.items.every(item => 
    item.question && 
    item.answer && 
    typeof item.question === 'string' && 
    typeof item.answer === 'string' &&
    item.question.trim().length > 0 &&
    item.answer.trim().length > 0
  );
}