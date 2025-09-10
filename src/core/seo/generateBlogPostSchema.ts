import { getEntry } from 'astro:content';
import { generateArticleSchema, generateBlogPostingSchema }from './schema';
import type { AuthorData, BlogFrontmatter, SiteSettings } from './schema';
import { parseFAQFromContent, validateFAQData } from '../../utils/faqParser';
import { generateFAQSchema } from './generateFAQSchema';


export async function generateBlogPostSchemaData(
  frontmatter: {
    title: string;
    description: string;
    pubDate: Date;
    author: string; 
    category: string; 
    tags: string[]; 
    image?: {
      url: string;
      alt: string;
    };
    featured?: boolean;
    status?: 'draft' | 'published';
  },
  url: string,
  schemaType: 'Article' | 'BlogPosting' = 'Article',
  content?: string 
) {
  
  if (!frontmatter) {
    return null;
  }

  if (!frontmatter?.title || !frontmatter?.description) {
    return null;
  }

  
  const shouldRender = frontmatter && 
                      frontmatter.title && 
                      frontmatter.description && 
                      frontmatter.status === 'published';

  if (!shouldRender) {
    return null;
  }

  try {
    
    let authorData: AuthorData | null = null;
    if (frontmatter.author) {
      try {
        const authorEntry = await getEntry('authors', frontmatter.author);
        if (authorEntry) {
          authorData = {
            id: authorEntry.id,
            name: authorEntry.data.name,
            bio: authorEntry.data.bio,
            avatar: authorEntry.data.avatar,
            email: authorEntry.data.email,
            twitter: authorEntry.data.twitter,
            github: authorEntry.data.github,
            website: authorEntry.data.website,
          };
        }
      } catch (error) {
      }
    }

    
    let categoryData: { id: string; name: string; description?: string; color?: string; slug?: string; } | null = null;
    if (frontmatter.category) {
      try {
        const categoryEntry = await getEntry('categories', frontmatter.category);
        if (categoryEntry) {
          categoryData = {
            id: categoryEntry.id,
            name: categoryEntry.data.name,
            description: categoryEntry.data.description,
            color: categoryEntry.data.color,
            slug: categoryEntry.data.slug,
          };
        }
      } catch (error) {
      }
    }

    
    let tagsData: Array<{ id: string; name: string; description?: string; color?: string; slug?: string; }> = [];
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
      try {
        const tagPromises = frontmatter.tags.map(async (tagId) => {
          if (!tagId || typeof tagId !== 'string') return null;
          
          try {
            const tagEntry = await getEntry('tags', tagId);
            if (tagEntry) {
              return {
                id: tagEntry.id,
                name: tagEntry.data.name,
                description: tagEntry.data.description,
                color: tagEntry.data.color,
                slug: tagEntry.data.slug,
              };
            }
            return null;
          } catch (error) {
            return null;
          }
        });
        
        const resolvedTags = await Promise.all(tagPromises);
        tagsData = resolvedTags.filter((tag): tag is NonNullable<typeof tag> => tag !== null);
      } catch (error) {
      }
    }

    
    let siteSettings: SiteSettings | null = null;
    try {
      const settingsEntry = await getEntry('settings', 'site-config');
      if (settingsEntry) {
        siteSettings = {
          id: settingsEntry.id,
          siteName: settingsEntry.data.siteName,
          siteDescription: settingsEntry.data.siteDescription,
          siteUrl: settingsEntry.data.siteUrl,
          author: settingsEntry.data.author,
          email: settingsEntry.data.email,
          logo: settingsEntry.data.logo,
          imageDomain: settingsEntry.data.imageDomain,
          defaultOgImage: settingsEntry.data.defaultOgImage,
          social: settingsEntry.data.social,
          contact: settingsEntry.data.contact,
        };
      }
    } catch (error) {
    }

    
    const safeAuthorData: AuthorData = authorData || {
      id: frontmatter.author || 'anonymous',
      name: frontmatter.author || 'Anonymous Author',
    };

    const safeCategoryData = categoryData || {
      id: frontmatter.category || 'general',
      name: frontmatter.category || 'General',
    };

    const safeTagsData = tagsData.length > 0 ? tagsData : 
      (frontmatter.tags || []).map(tag => ({
        id: tag,
        name: tag,
      }));

    const safeSiteSettings: SiteSettings = siteSettings || {
      id: 'site-config',
      siteName: 'Website',
      siteDescription: 'A website',
      siteUrl: new URL(url).origin,
      author: 'Website Author',
      email: 'contact@example.com',
      defaultOgImage: '/og-image.jpg',
    };

    
    const enhancedFrontmatter: BlogFrontmatter = {
      title: frontmatter.title,
      description: frontmatter.description,
      pubDate: frontmatter.pubDate,
      author: safeAuthorData,
      category: safeCategoryData,
      tags: safeTagsData,
      image: frontmatter.image,
      featured: frontmatter.featured || false,
      status: frontmatter.status || 'published',
    };

    
    let faqSchema = null;
    if (content) {
      try {
        const faqData = parseFAQFromContent(content);
        if (faqData && validateFAQData(faqData)) {
          faqSchema = generateFAQSchema(faqData);
        }
      } catch (error) {
      }
    }

    
    try {
      let mainSchema;
      if (schemaType === 'BlogPosting') {
        mainSchema = generateBlogPostingSchema({
          frontmatter: enhancedFrontmatter,
          url,
          settings: safeSiteSettings,
        });
      } else {
        mainSchema = generateArticleSchema({
          frontmatter: enhancedFrontmatter,
          url,
          settings: safeSiteSettings,
        });
      }

      
      if (faqSchema) {
        return [mainSchema, faqSchema];
      }
      
      return mainSchema;
    } catch (error) {
      
      
      const fallbackSchema = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "headline": frontmatter.title,
        "description": frontmatter.description,
        "author": {
          "@type": "Person",
          "name": safeAuthorData.name
        },
        "publisher": {
          "@type": "Organization",
          "name": safeSiteSettings.siteName,
          "url": safeSiteSettings.siteUrl
        },
        "datePublished": frontmatter.pubDate.toISOString(),
        "dateModified": frontmatter.pubDate.toISOString(),
        "url": url
      };

      
      if (faqSchema) {
        return [fallbackSchema, faqSchema];
      }
      
      return fallbackSchema;
    }

  } catch (error) {
    return null;
  }
}