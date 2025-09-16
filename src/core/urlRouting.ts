import { getSiteSettings } from './blogLogic';

export type URLStructure = 'direct' | 'prefixed';

export interface BlogRoutingConfig {
  urlStructure: URLStructure;
}

export async function getBlogRoutingConfig(): Promise<BlogRoutingConfig> {
  const settings = await getSiteSettings();
  const structure = settings.blogRouting?.urlStructure || 'direct';
  // console.log('URL routing config:', structure);
  return {
    urlStructure: structure
  };
}

export async function getBlogURLStructure(): Promise<URLStructure> {
  const config = await getBlogRoutingConfig();
  return config.urlStructure;
}

export async function generatePostURL(postSlug: string): Promise<string> {
  const structure = await getBlogURLStructure();
  return structure === 'direct' ? `/${postSlug}` : `/blog/${postSlug}`;
}

export async function generatePostFullURL(postSlug: string, siteUrl: string): Promise<string> {
  const postPath = await generatePostURL(postSlug);
  return `${siteUrl}${postPath}`;
}

export async function shouldGenerateDirectRoutes(): Promise<boolean> {
  const structure = await getBlogURLStructure();
  return structure === 'direct';
}

export async function shouldGeneratePrefixedRoutes(): Promise<boolean> {
  const structure = await getBlogURLStructure();
  return structure === 'prefixed';
}

// Helper function for components that need post URLs
export async function getPostUrl(postId: string): Promise<string> {
  return await generatePostURL(postId);
}