import { getCollection } from 'astro:content';
import { generatePersonSchema } from './schema';
import type { AuthorData, SiteSettings } from './schema';

export async function generateAuthorsListSchemaData(
  authors: Array<{
    id: string;
    data: {
      name: string;
      bio?: string;
      avatar?: string;
      email?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
    postCount: number;
  }>,
  url: string
) {
  
  if (!authors || !Array.isArray(authors) || authors.length === 0) {
    return null;
  }

  try {
    
    let siteSettings: SiteSettings | null = null;
    try {
      const allSettings = await getCollection('settings');
      const settingsData = allSettings[0]?.data;

      if (settingsData) {
        siteSettings = {
          id: 'site-config',
          siteName: settingsData.siteName,
          siteDescription: settingsData.siteDescription,
          siteUrl: settingsData.siteUrl,
          author: settingsData.author,
          email: settingsData.email,
          logo: settingsData.logo,
          imageDomain: settingsData.imageDomain,
          defaultOgImage: settingsData.defaultOgImage,
          social: settingsData.social,
          contact: settingsData.contact,
        };
      }
    } catch (error) {
    }

    
    const authorSchemas = authors.map(author => {
      try {
        const authorData: AuthorData = {
          id: author.id,
          name: author.data.name,
          bio: author.data.bio,
          avatar: author.data.avatar,
          email: author.data.email,
          twitter: author.data.twitter,
          github: author.data.github,
          website: author.data.website,
        };

        const personSchema = generatePersonSchema(authorData);

        
        const enhancedSchema = Object.assign({}, personSchema, {
          "@id": `${siteSettings?.siteUrl || ''}/authors/${author.id}`,
          "url": `${siteSettings?.siteUrl || ''}/authors/${author.id}`,
        });

        if (siteSettings) {
          Object.assign(enhancedSchema, {
            "jobTitle": `Author at ${siteSettings.siteName}`,
            "worksFor": {
              "@type": "Organization",
              "name": siteSettings.siteName,
              "url": siteSettings.siteUrl
            }
          });
        }

        if (author.postCount > 0) {
          Object.assign(enhancedSchema, {
            "knowsAbout": `Content creation and writing - ${author.postCount} published articles`
          });
        }

        return enhancedSchema;
      } catch (error) {
        
        return {
          "@type": "Person",
          "@id": `${siteSettings?.siteUrl || ''}/authors/${author.id}`,
          "name": author.data.name,
          "url": `${siteSettings?.siteUrl || ''}/authors/${author.id}`
        };
      }
    });

    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      "url": url,
      "name": `Authors - ${siteSettings?.siteName || 'Website'}`,
      "description": `Meet the talented authors contributing to ${siteSettings?.siteName || 'our website'}`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": authors.length,
        "itemListElement": authorSchemas.map((authorSchema, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": authorSchema
        }))
      },
      ...(siteSettings && {
        "isPartOf": {
          "@type": "WebSite",
          "name": siteSettings.siteName,
          "url": siteSettings.siteUrl
        }
      }),
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteSettings?.siteUrl || url.replace('/authors', '')
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Authors",
            "item": url
          }
        ]
      }
    };

  } catch (error) {

    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      "name": "Authors",
      "url": url,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": authors.length
      }
    };
  }
}