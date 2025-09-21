import type { Product, WithContext, Offer, AggregateRating, Brand, Organization } from 'schema-dts';
import type { SiteSettings } from '../blogLogic';

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  imageAlt: string;
  affiliateUrl: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
}

export interface ProductSchemaProps {
  product: ProductData;
  url: string;
  settings: SiteSettings;
}

/**
 * Generates Product schema markup for SEO
 */
export function generateProductSchema(props: ProductSchemaProps): WithContext<Product> {
  const { product, url, settings } = props;

  // Convert price string to number - handle both $39 and 39$ formats
  const priceValue = parseFloat(product.price.replace(/[$,\s]/g, ''));
  const originalPriceValue = product.originalPrice
    ? parseFloat(product.originalPrice.replace(/[$,\s]/g, ''))
    : undefined;

  // Create brand schema
  const brandSchema: Brand = {
    "@type": "Brand",
    "name": product.brand || "Generic"
  };

  // Create organization schema for seller
  const sellerSchema: Organization = {
    "@type": "Organization",
    "name": settings.siteName,
    "url": settings.siteUrl
  };

  // Create offer schema
  const offerSchema: Offer = {
    "@type": "Offer",
    "url": product.affiliateUrl,
    "priceCurrency": "USD",
    "price": priceValue.toString(),
    "availability": "https://schema.org/InStock",
    "seller": sellerSchema,
    "validFrom": new Date().toISOString(),
    ...(originalPriceValue && originalPriceValue > priceValue && {
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })
  };

  // Create aggregate rating if available
  const aggregateRating: AggregateRating | undefined = product.rating && product.reviewCount ? {
    "@type": "AggregateRating",
    "ratingValue": product.rating.toString(),
    "reviewCount": product.reviewCount,
    "bestRating": "5",
    "worstRating": "1"
  } : undefined;

  // Generate category-specific additional properties
  const additionalProperties = generateCategorySpecificProperties(product.category);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.image,
    "brand": brandSchema,
    "offers": offerSchema,
    "url": url,
    "sku": product.id,
    "mpn": product.id,
    ...(aggregateRating && { "aggregateRating": aggregateRating }),
    ...(product.category && { "category": getCategoryDisplayName(product.category) }),
    ...additionalProperties
  };
}

/**
 * Generate category-specific properties for enhanced SEO
 */
function generateCategorySpecificProperties(category?: string): Record<string, any> {
  if (!category) return {};

  const categoryProps: Record<string, Record<string, any>> = {
    'weight-loss-supplements': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "weight-loss-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements"
    },
    'mens-health': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "mens-health-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Men's Health",
      "audience": {
        "@type": "PeopleAudience",
        "suggestedGender": "Male"
      }
    },
    'womens-health': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "womens-health-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Women's Health",
      "audience": {
        "@type": "PeopleAudience",
        "suggestedGender": "Female"
      }
    },
    'vitamins': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "vitamin-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Vitamins"
    },
    'blood-sugar': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "blood-sugar-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Blood Sugar Support",
      "healthCondition": "Blood Sugar Management"
    },
    'memory-brain': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "brain-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Brain Health",
      "healthCondition": "Cognitive Health"
    },
    'joint-bone': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "joint-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Joint Health",
      "healthCondition": "Joint Health"
    },
    'heart-health': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "heart-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Heart Health",
      "healthCondition": "Cardiovascular Health"
    },
    'gut-health': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "digestive-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Digestive Health",
      "healthCondition": "Digestive Health"
    },
    'skin-hair': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "beauty-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Beauty",
      "healthCondition": "Skin & Hair Health"
    },
    'sleep-recovery': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "sleep-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Sleep Support",
      "healthCondition": "Sleep Quality"
    },
    'energy-performance': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "energy-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Energy & Performance",
      "healthCondition": "Energy & Performance"
    },
    'immune-support': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "immune-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Immune Support",
      "healthCondition": "Immune System Support"
    },
    'stress-mood': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "mood-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Mood Support",
      "healthCondition": "Stress & Mood"
    },
    'anti-aging': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "anti-aging-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Anti-Aging",
      "healthCondition": "Healthy Aging"
    },
    'dental-health': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "dental-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Oral Health",
      "healthCondition": "Dental Health"
    },
    'fat-burner': {
      "additionalType": "https://schema.org/DietarySupplement",
      "productID": "fat-burner-supplement",
      "category": "Health & Beauty > Health Care > Vitamins & Supplements > Weight Management",
      "healthCondition": "Weight Management"
    }
  };

  return categoryProps[category] || {
    "additionalType": "https://schema.org/DietarySupplement",
    "category": "Health & Beauty > Health Care > Vitamins & Supplements"
  };
}

/**
 * Get display name for category
 */
function getCategoryDisplayName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'weight-loss-supplements': 'Weight Loss Supplements',
    'mens-health': "Men's Health & Testosterone",
    'womens-health': "Women's Health",
    'vitamins': 'Vitamins & Minerals',
    'blood-sugar': 'Blood Sugar & Diabetes Support',
    'memory-brain': 'Brain Health & Memory',
    'joint-bone': 'Joint & Bone Health',
    'heart-health': 'Heart & Cardiovascular',
    'gut-health': 'Digestive & Gut Health',
    'skin-hair': 'Skin & Hair Care',
    'sleep-recovery': 'Sleep & Recovery',
    'energy-performance': 'Energy & Performance',
    'immune-support': 'Immune Support',
    'stress-mood': 'Stress & Mood Support',
    'anti-aging': 'Anti-Aging & Longevity',
    'dental-health': 'Dental & Oral Health',
    'fat-burner': 'Fat Burners & Metabolism'
  };

  return categoryNames[categoryId] || 'Health Supplements';
}