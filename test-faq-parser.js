// Test script for FAQ parser - Simple regex test
// This tests the core logic without TypeScript imports

// Sample FAQ content from your MDX file
const sampleContent = `
# Kerassentials Review

Some intro content here...

## Kerassentials Frequently Asked Questions (FAQ)

During my research, I gathered common questions that potential users often have about [Kerassentials](https://e4fa9-xan7sd4k2y46j8upwqab.hop.clickbank.net). Here are some of the most frequently asked questions, along with comprehensive answers to help clarify any doubts.

### Q1: What is the recommended dosage/application for Kerassentials?

A1: For optimal results, apply [Kerassentials](https://e4fa9-xan7sd4k2y46j8upwqab.hop.clickbank.net) four times daily: once in the morning, at noon, in the evening, and before bed. Use the provided dropper applicator to apply a small amount directly to the affected nail and surrounding skin, then gently massage it in with a cotton swab after filing the nail surface.

### Q2: How long does it take to see results with Kerassentials?

A2: While individual results may vary, most users begin to see noticeable improvements within a few weeks of consistent daily use. However, for complete eradication of fungus and full nail regeneration, it is strongly recommended to use [Kerassentials](https://e4fa9-xan7sd4k2y46j8upwqab.hop.clickbank.net) for at least 3 months (90 days). For severe or long-standing infections, a 6-month (180 days) course may be necessary to ensure lasting results and prevent recurrence.

### Q3: Are there any side effects?

A3: [Kerassentials](https://e4fa9-xan7sd4k2y46j8upwqab.hop.clickbank.net) is formulated with natural ingredients and is generally well-tolerated. However, as it contains potent essential oils, some individuals with very sensitive skin might experience mild irritation, redness, or itching at the application site. If irritation persists, discontinue use. The product is for external use only; avoid contact with eyes and do not swallow.

More content after FAQ...
`;

// Implement the core FAQ parsing logic directly for testing
function parseFAQFromContent(content) {
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

  // Find the FAQ section content
  const faqSectionIndex = content.indexOf(faqSectionMatch[0]);
  const faqContent = content.substring(faqSectionIndex);

  // Parse Q&A pairs with flexible patterns
  const qaRegex = /###\s*Q\d*:?\s*(.+?)\n+A\d*:?\s*(.+?)(?=\n###|\n\n[^A]|$)/gis;
  const matches = Array.from(faqContent.matchAll(qaRegex));

  if (matches.length === 0) {
    return null;
  }

  const items = matches.map(match => {
    const question = cleanText(match[1]);
    const answer = cleanText(match[2]);
    
    return {
      question,
      answer: stripMarkdownLinks(answer)
    };
  });

  return {
    title: faqTitle,
    items
  };
}

function cleanText(text) {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarkdownLinks(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function validateFAQData(faqData) {
  if (!faqData || !faqData.items || !Array.isArray(faqData.items)) {
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

function generateFAQSchema(faqData) {
  if (!faqData || !faqData.items || faqData.items.length === 0) {
    return null;
  }

  const mainEntity = faqData.items.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity
  };
}

console.log('Testing FAQ Parser...\n');

// Test FAQ parsing
const faqData = parseFAQFromContent(sampleContent);

if (faqData) {
  console.log('✅ FAQ Data Parsed Successfully!');
  console.log('Title:', faqData.title);
  console.log('Number of FAQ items:', faqData.items.length);
  
  console.log('\nFAQ Items:');
  faqData.items.forEach((item, index) => {
    console.log(`\n${index + 1}. Q: ${item.question}`);
    console.log(`   A: ${item.answer.substring(0, 100)}...`);
  });

  // Test validation
  const isValid = validateFAQData(faqData);
  console.log('\n✅ FAQ Data Validation:', isValid ? 'PASSED' : 'FAILED');

  // Test schema generation
  const faqSchema = generateFAQSchema(faqData);
  if (faqSchema) {
    console.log('\n✅ FAQ Schema Generated Successfully!');
    console.log('Schema Type:', faqSchema['@type']);
    console.log('Number of Questions:', faqSchema.mainEntity.length);
    
    console.log('\nSample Schema Output:');
    console.log(JSON.stringify(faqSchema, null, 2));
  } else {
    console.log('\n❌ Failed to generate FAQ schema');
  }
} else {
  console.log('❌ Failed to parse FAQ content');
}