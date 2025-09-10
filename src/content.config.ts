
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const tags = defineCollection({
  loader: file("src/content/data/tags.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    slug: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
      ogImageAlt: z.string().optional(),
    }).optional(),
  }),
});

const authors = defineCollection({
  loader: file("src/content/data/authors.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    website: z.string().url().optional(),
  }),
});

const categories = defineCollection({
  loader: file("src/content/data/categories.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    slug: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
      ogImageAlt: z.string().optional(),
    }).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: reference('authors'),
    category: reference('categories'),
    tags: z.array(reference('tags')),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }).optional(),
    featured: z.boolean().default(false),
    status: z.enum(['draft', 'published']).default('published'),
  })
});

const settings = defineCollection({
  loader: file("src/content/data/settings.json"),
  schema: z.object({
    id: z.string(),
    siteName: z.string(),
    siteTitle: z.string().optional(),
    siteDescription: z.string(),
    siteUrl: z.string().url(),
    author: z.string(),
    email: z.string().email(),
    logo: z.string().optional(),
    imageDomain: z.string().url().optional(),
    defaultOgImage: z.string().default("/og-image.jpg"),

    seo: z.object({
      sitename: z.string().optional(),
      locale: z.string().optional(),
      author: z.string().optional(),
    }).optional(),

    social: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
      discord: z.string().optional(),
      reddit: z.string().optional(),
    }).optional(),

    contact: z.object({
      email: z.string().email().optional(),
      alias: z.string().optional(),
    }).optional(),

    favicons: z.object({
      icon32: z.string().optional(),
      icon16: z.string().optional(),
      appleTouchIcon: z.string().optional(),
      mainIcon: z.string().optional(),
      manifest: z.string().optional(),
    }).optional(),

    performance: z.object({
      preconnectUrls: z.array(z.string()).optional(),
    }).optional(),

    analytics: z.object({
      googleAnalytics: z.string().optional(),
    }).optional(),

    rss: z.object({
      enabled: z.boolean().default(true),
      itemsPerPage: z.number().default(20),
    }).optional(),

    theme: z.object({
      primaryColor: z.string().default("#3b82f6"),
    }).optional(),

    disclaimer: z.object({
      enabled: z.boolean().default(true),
      text: z.string().optional(),
    }).optional(),



    themeSettings: z.object({
      colors: z.object({
        primary: z.string(),
        primaryLight: z.string(),
        primaryDark: z.string(),
        secondary: z.string(),
        accent: z.string(),
        textPrimary: z.string(),
        textSecondary: z.string(),
        textMuted: z.string(),
        textAccent: z.string(),
        bgPrimary: z.string(),
        bgSecondary: z.string(),
        bgTertiary: z.string(),
        surfaceCard: z.string(),
        surfaceOverlay: z.string(),
        borderDefault: z.string(),
        borderLight: z.string(),
        borderAccent: z.string(),
      }),
      typography: z.object({
        fontHeading: z.string(),
        fontBody: z.string(),
        fontMono: z.string(),
        textXs: z.string(),
        textSm: z.string(),
        textBase: z.string(),
        textLg: z.string(),
        textXl: z.string(),
        text2xl: z.string(),
        text3xl: z.string(),
        text4xl: z.string(),
      }),
      spacing: z.object({
        containerMaxWidth: z.string(),
        sectionPadding: z.string(),
        cardPadding: z.string(),
        buttonPadding: z.string(),
      }),
      borderRadius: z.object({
        sm: z.string(),
        md: z.string(),
        lg: z.string(),
        xl: z.string(),
        full: z.string(),
      }),
      shadows: z.object({
        sm: z.string(),
        md: z.string(),
        lg: z.string(),
        xl: z.string(),
      }),
      animation: z.object({
        duration: z.string(),
        easing: z.string(),
      }),
      transitions: z.object({
        pageStyle: z.string(),
        speed: z.string(),
        loadingStyle: z.string(),
        reducedMotion: z.string(),
      }),
    }).optional(),
  }),
});

const pages = defineCollection({
  loader: file("src/content/data/pages.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    content: z.string().optional(), 
    published: z.boolean().default(true),
    noindex: z.boolean().default(false),
    
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      canonical: z.string().optional(),
    }).optional(),
  }),
});


const affiliateCategories = defineCollection({
  loader: file("src/content/data/affiliate-categories.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
  }),
});


const affiliateProducts = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/content/data/products/"
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.string(),
    affiliateUrl: z.string().url(),
    image: z.string(),
    imageAlt: z.string(),
    category: reference('affiliateCategories'),
    originalPrice: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().optional(),
    brand: z.string().optional(),
    features: z.array(z.string()).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    badge: z.string().optional(),
    buttonText: z.string().optional(),
  }),
});


const affiliateComparisons = defineCollection({
  loader: file("src/content/data/affiliate-comparisons.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    products: z.array(reference('affiliateProducts')),
    description: z.string().optional(),
    category: reference('affiliateCategories').optional(),
    active: z.boolean().default(true),
  }),
});


const ads = defineCollection({
  loader: file("src/content/data/ads.json"),
  schema: z.object({
    id: z.string(),
    global: z.object({
      enabled: z.boolean(),
      testMode: z.boolean().default(false),
      
      security: z.object({
        allowHtmlAds: z.boolean().default(false),
      }).optional(),
    }),
    banners: z.array(z.object({
      id: z.string(),
      name: z.string(),
      enabled: z.boolean().default(true),
      
      type: z.enum(['image', 'html']).default('image'),
      
      
      image: z.string().optional(),
      link: z.string().url().optional(),
      alt: z.string().optional(),
      
      
      htmlContent: z.string().optional().refine((content) => {
        if (!content) return true; 
        
        
        const hasIframe = /<iframe[\s\S]*?<\/iframe>/gi.test(content) || /<iframe[^>]*\/?>/gi.test(content);
        
        return !hasIframe;
      }, {
        message: "HTML content cannot contain iframe tags. Use only pure HTML elements like <a>, <img>, <div>, etc."
      }),
      
      
      placement: z.enum([
        'between-hero-and-content',
        'ad-section-2-sidebar', 
        'ad-section-2-horizontal',
        'article-content',
        'article-sidebar',
        'homepage-between-posts',
        'categories-sidebar',
        'tags-sidebar'
      ]),
      priority: z.number().default(1), 
    })).refine((banners) => {
      
      return banners.every(banner => {
        switch (banner.type) {
          case 'image':
            return banner.image && banner.alt;
          case 'html':
            return banner.htmlContent;
          default:
            return false;
        }
      });
    }, {
      message: "Each ad must have the required content fields for its type (image+alt for 'image', htmlContent for 'html')"
    })
  })
});


const forms = defineCollection({
  loader: file("src/content/data/forms.json"),
  schema: z.object({
    id: z.string(),
    enabled: z.boolean().default(true),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    buttonText: z.string(),
  })
});

export const collections = {
  blog,
  authors,
  categories,
  tags,
  settings,
  pages,
  affiliateCategories,
  affiliateProducts,
  affiliateComparisons,
  ads,
  forms
};