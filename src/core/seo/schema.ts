

import type { 
  Article, 
  Person, 
  Organization, 
  ImageObject,
  BlogPosting,
  WithContext
} from 'schema-dts';
import type { SiteSettings } from '../blogLogic';


export type { SiteSettings } from '../blogLogic';


export interface AuthorData {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  twitter?: string;
  github?: string;
  website?: string;
}




export interface BlogFrontmatter {
  title: string;
  description: string;
  pubDate: Date;
  author: AuthorData;
  category: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    slug?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    description?: string;
    color?: string;
    slug?: string;
  }>;
  image?: {
    url: string;
    alt: string;
  };
  featured?: boolean;
  status: 'draft' | 'published';
}


export interface BlogSchemaProps {
  frontmatter: BlogFrontmatter;
  url: string;
  settings: SiteSettings;
}


export function generateArticleSchema(props: BlogSchemaProps): WithContext<Article> {
  const { frontmatter, url, settings } = props;

  const authorSchema: Person = {
    "@type": "Person",
    "name": frontmatter.author.name,
    ...(frontmatter.author.bio && { "description": frontmatter.author.bio }),
    ...(frontmatter.author.website && { "url": frontmatter.author.website }),
    ...(frontmatter.author.email && { "email": frontmatter.author.email })
  };

  const publisherSchema: Organization = {
    "@type": "Organization",
    "name": settings.siteName,
    "url": settings.siteUrl
  };

  const imageSchema: ImageObject | undefined = frontmatter.image ? {
    "@type": "ImageObject",
    "url": frontmatter.image.url,
    "name": frontmatter.image.alt,
    "description": frontmatter.image.alt
  } : undefined;

  const keywords = frontmatter.tags.map(tag => tag.name);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": frontmatter.title,
    "description": frontmatter.description,
    "author": authorSchema,
    "publisher": publisherSchema,
    "datePublished": frontmatter.pubDate.toISOString(),
    "dateModified": frontmatter.pubDate.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "url": url,
    "keywords": keywords,
    ...(imageSchema && { "image": imageSchema }),
    ...(frontmatter.category.name && { "articleSection": frontmatter.category.name })
  };
}


export function generateBlogPostingSchema(props: BlogSchemaProps): WithContext<BlogPosting> {
  const articleSchema = generateArticleSchema(props);
  
  return {
    ...articleSchema,
    "@type": "BlogPosting"
  };
}


export function generatePersonSchema(author: AuthorData): WithContext<Person> {
  const sameAs: string[] = [];
  
  if (author.twitter) {
    const handle = author.twitter.replace('@', '');
    sameAs.push(`https://twitter.com/${handle}`);
  }
  
  if (author.github) {
    sameAs.push(`https://github.com/${author.github}`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    ...(author.bio && { "description": author.bio }),
    ...(author.avatar && { "image": author.avatar }),
    ...(author.email && { "email": author.email }),
    ...(author.website && { "url": author.website }),
    ...(sameAs.length > 0 && { "sameAs": sameAs })
  };
}


export function generateOrganizationSchema(settings: SiteSettings): WithContext<Organization> {
  const sameAs: string[] = [];
  
  
  if (settings.social?.twitter) {
    const handle = settings.social.twitter.replace('@', '');
    sameAs.push(`https://twitter.com/${handle}`);
  }
  
  
  if (settings.social?.github) {
    
    const githubUrl = settings.social.github.startsWith('http') 
      ? settings.social.github 
      : `https://github.com/${settings.social.github}`;
    sameAs.push(githubUrl);
  }
  
  
  if (settings.social?.linkedin) {
    
    const linkedinUrl = settings.social.linkedin.startsWith('http')
      ? settings.social.linkedin
      : `https://linkedin.com/company/${settings.social.linkedin}`;
    sameAs.push(linkedinUrl);
  }
  
  
  if (settings.social?.facebook) {
    const facebookUrl = settings.social.facebook.startsWith('http')
      ? settings.social.facebook
      : `https://facebook.com/${settings.social.facebook}`;
    sameAs.push(facebookUrl);
  }
  
  
  if (settings.social?.instagram) {
    const handle = settings.social.instagram.replace('@', '');
    sameAs.push(`https://instagram.com/${handle}`);
  }
  
  
  if (settings.social?.youtube) {
    const youtubeUrl = settings.social.youtube.startsWith('http')
      ? settings.social.youtube
      : `https://youtube.com/${settings.social.youtube}`;
    sameAs.push(youtubeUrl);
  }
  
  
  if (settings.social?.tiktok) {
    const handle = settings.social.tiktok.replace('@', '');
    sameAs.push(`https://tiktok.com/@${handle}`);
  }
  
  
  if (settings.social?.discord) {
    
    const discordUrl = settings.social.discord.startsWith('http')
      ? settings.social.discord
      : `https://discord.gg/${settings.social.discord}`;
    sameAs.push(discordUrl);
  }
  
  
  if (settings.social?.reddit) {
    const subredditUrl = settings.social.reddit.startsWith('http')
      ? settings.social.reddit
      : `https://reddit.com/r/${settings.social.reddit}`;
    sameAs.push(subredditUrl);
  }
  
  
  if (settings.social?.mastodon) {
    
    if (settings.social.mastodon.startsWith('http')) {
      sameAs.push(settings.social.mastodon);
    } else if (settings.social.mastodon.includes('@')) {
      
      const parts = settings.social.mastodon.replace('@', '').split('@');
      if (parts.length === 2) {
        sameAs.push(`https://${parts[1]}/@${parts[0]}`);
      }
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings.siteName,
    "url": settings.siteUrl,
    ...(settings.logo && { "logo": settings.logo }),
    ...(sameAs.length > 0 && { "sameAs": sameAs }),
    ...(settings.email && {
      "contactPoint": {
        "@type": "ContactPoint",
        "email": settings.email,
        "contactType": "customer service"
      }
    })
  };
}


export function generateImageSchema(image: { url: string; alt: string }): ImageObject {
  return {
    "@type": "ImageObject",
    "url": image.url,
    "name": image.alt,
    "description": image.alt
  };
}