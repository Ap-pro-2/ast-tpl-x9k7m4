/**
 * Internal Links Extractor
 * Extracts internal links from markdown content for blog posts API
 */

export interface InternalLink {
  anchorText: string;
  targetUrl: string;
  targetSlug?: string;
  isRelative: boolean;
}

export interface InternalLinksData {
  internalLinks: InternalLink[];
  totalInternalLinks: number;
}

/**
 * Extracts internal links from markdown content
 * @param content - The markdown content to parse
 * @param siteUrl - The site's base URL to identify internal links
 * @returns Array of internal links with metadata
 */
export function extractInternalLinks(content: string, siteUrl: string): InternalLinksData {
  if (!content || !siteUrl) {
    return {
      internalLinks: [],
      totalInternalLinks: 0
    };
  }

  const internalLinks: InternalLink[] = [];

  // Clean site URL - remove trailing slash for consistent comparison
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const siteHost = new URL(cleanSiteUrl).hostname;

  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const [, anchorText, url] = match;

    // Skip empty anchor text or URLs
    if (!anchorText.trim() || !url.trim()) {
      continue;
    }

    // Skip anchor links (starting with #)
    if (url.startsWith('#')) {
      continue;
    }

    let isInternal = false;
    let targetUrl = url;
    let targetSlug: string | undefined;
    let isRelative = false;

    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Absolute URL - check if it matches our site
        const urlObj = new URL(url);
        if (urlObj.hostname === siteHost) {
          isInternal = true;
          targetUrl = url;
          // Extract slug from pathname
          targetSlug = extractSlugFromPath(urlObj.pathname);
        }
      } else if (url.startsWith('/')) {
        // Relative URL starting with / - internal link
        isInternal = true;
        isRelative = true;
        targetUrl = `${cleanSiteUrl}${url}`;
        targetSlug = extractSlugFromPath(url);
      } else if (!url.includes('://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        // Relative URL without leading / - likely internal
        isInternal = true;
        isRelative = true;
        targetUrl = `${cleanSiteUrl}/${url}`;
        targetSlug = extractSlugFromPath(url);
      }

      // Only include internal links
      if (isInternal) {
        internalLinks.push({
          anchorText: anchorText.trim(),
          targetUrl,
          targetSlug,
          isRelative
        });
      }
    } catch (error) {
      // Invalid URL, skip
      continue;
    }
  }

  // Remove duplicates based on targetUrl and anchorText combination
  const uniqueLinks = internalLinks.filter((link, index, array) => {
    return array.findIndex(l =>
      l.targetUrl === link.targetUrl && l.anchorText === link.anchorText
    ) === index;
  });

  return {
    internalLinks: uniqueLinks,
    totalInternalLinks: uniqueLinks.length
  };
}

/**
 * Extracts slug from URL path
 * @param path - URL path to extract slug from
 * @returns Extracted slug or undefined
 */
function extractSlugFromPath(path: string): string | undefined {
  if (!path) return undefined;

  // Remove leading/trailing slashes and extract meaningful slug
  const cleanPath = path.replace(/^\/+|\/+$/g, '');

  if (!cleanPath) return undefined;

  // Handle common blog URL patterns
  const pathParts = cleanPath.split('/');

  // For paths like /blog/post-slug or /post-slug
  if (pathParts.length >= 1) {
    const lastPart = pathParts[pathParts.length - 1];
    // Remove file extensions if present
    return lastPart.replace(/\.(html|md|mdx)$/, '');
  }

  return cleanPath;
}

/**
 * Validates if a link target exists in the blog collection
 * @param slug - The target slug to validate
 * @param allPosts - Array of all blog posts
 * @returns Boolean indicating if the target exists
 */
export function validateInternalLinkTarget(slug: string, allPosts: any[]): boolean {
  if (!slug || !allPosts) return false;

  return allPosts.some(post =>
    post.id === slug ||
    post.slug === slug ||
    post.data?.slug === slug
  );
}

/**
 * Enriches internal links with validation status
 * @param linksData - Internal links data to enrich
 * @param allPosts - Array of all blog posts for validation
 * @returns Enriched links data with validation info
 */
export function enrichInternalLinks(linksData: InternalLinksData, allPosts: any[]): InternalLinksData & {
  validLinks: number;
  brokenLinks: number;
} {
  let validLinks = 0;
  let brokenLinks = 0;

  const enrichedLinks = linksData.internalLinks.map(link => {
    const isValid = link.targetSlug ? validateInternalLinkTarget(link.targetSlug, allPosts) : false;

    if (isValid) {
      validLinks++;
    } else {
      brokenLinks++;
    }

    return {
      ...link,
      isValid
    };
  });

  return {
    internalLinks: enrichedLinks,
    totalInternalLinks: linksData.totalInternalLinks,
    validLinks,
    brokenLinks
  };
}