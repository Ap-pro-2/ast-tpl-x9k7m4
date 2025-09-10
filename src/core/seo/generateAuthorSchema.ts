import { getCollection } from 'astro:content';
import { generatePersonSchema } from './schema';
import type { AuthorData, SiteSettings } from './schema';

export async function generateAuthorSchemaData(
  author: {
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
  },
  url: string,
  postCount: number = 0
) {
  
  if (!author?.data?.name) {
    return null;
  }

  try {
    
    let siteSettings: SiteSettings | null = null;
    try {
      const allSettings = await getCollection("settings");
      const settingsData = allSettings[0]?.data;

      if (settingsData) {
        siteSettings = {
          id: "site-config",
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

    
    return Object.assign({}, personSchema, {
      "@id": url,
      url: url,
      
      ...(siteSettings && {
        jobTitle: `Author at ${siteSettings.siteName}`,
        worksFor: {
          "@type": "Organization",
          name: siteSettings.siteName,
          url: siteSettings.siteUrl,
        },
      }),
      
      ...(postCount > 0 && {
        knowsAbout: `Content creation and writing - ${postCount} published articles`,
      }),
      
      mainEntityOfPage: {
        "@type": "ProfilePage",
        "@id": url,
        url: url,
      },
    });
  } catch (error) {

    
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": url,
      name: author.data.name,
      url: url,
      ...(author.data.bio && { description: author.data.bio }),
      mainEntityOfPage: {
        "@type": "ProfilePage",
        "@id": url,
      },
    };
  }
}
