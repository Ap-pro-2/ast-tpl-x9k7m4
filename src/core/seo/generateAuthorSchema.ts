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
  // Early validation
  if (!author?.data?.name) {
    console.warn("AuthorSchema: Invalid author data provided");
    return null;
  }

  try {
    // Fetch site settings for additional context
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
      console.warn("AuthorSchema: Failed to fetch site settings:", error);
    }

    // Convert author data to AuthorData interface
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

    // Generate Person schema
    const personSchema = generatePersonSchema(authorData);

    // Convert to plain object and enhance with additional properties for author pages
    return Object.assign({}, personSchema, {
      "@id": url,
      url: url,
      // Add job title/role if we have site settings
      ...(siteSettings && {
        jobTitle: `Author at ${siteSettings.siteName}`,
        worksFor: {
          "@type": "Organization",
          name: siteSettings.siteName,
          url: siteSettings.siteUrl,
        },
      }),
      // Add additional properties if available
      ...(postCount > 0 && {
        knowsAbout: `Content creation and writing - ${postCount} published articles`,
      }),
      // Add mainEntityOfPage for the author profile page
      mainEntityOfPage: {
        "@type": "ProfilePage",
        "@id": url,
        url: url,
      },
    });
  } catch (error) {
    console.error("AuthorSchema: Failed to generate author schema:", error);

    // Create minimal fallback schema
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
