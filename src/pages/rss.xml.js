import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  try {
    // Get settings
    const allSettings = await getCollection('settings');
    const userSettings = allSettings[0]?.data || {};
    
    // Check if RSS is enabled
    if (!userSettings.rss?.enabled) {
      return new Response('RSS feed is disabled', { status: 404 });
    }
    
    // Get posts from content collections
    const allPosts = await getCollection('blog', ({ data }) => {
      return import.meta.env.PROD ? data.status === 'published' : true;
    });

    // Get authors and categories for enriched content
    const allAuthors = await getCollection('authors');
    const allCategories = await getCollection('categories');
    const allTags = await getCollection('tags');

    // Create lookup maps
    const authorMap = new Map(allAuthors.map(author => [author.id, author.data]));
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.data]));
    const tagMap = new Map(allTags.map(tag => [tag.id, tag.data]));

    // Sort posts by date (newest first)
    const sortedPosts = allPosts.sort((a, b) => 
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );

    // Limit posts if specified
    const maxItems = userSettings.rss?.itemsPerPage || 20;
    const limitedPosts = sortedPosts.slice(0, maxItems);

    // Convert to RSS items
    const rssItems = limitedPosts.map(post => {
      const author = authorMap.get(post.data.author.id);
      const category = categoryMap.get(post.data.category.id);
      const tags = post.data.tags.map(tagRef => {
        const tag = tagMap.get(tagRef.id);
        return tag ? tag.name : tagRef.id;
      });

      return {
        title: post.data.title,
        link: `/blog/${post.id}`,
        description: post.data.description || '',
        pubDate: post.data.pubDate,
        author: author ? `${userSettings.email || 'hello@example.com'} (${author.name})` : userSettings.email || 'hello@example.com',
        categories: [category?.name, ...tags].filter(Boolean),
        customData: post.data.image ? 
          `<enclosure url="${userSettings.siteUrl || 'https://example.com'}${post.data.image.url}" type="image/jpeg" />` : 
          undefined,
      };
    });

    // Generate categories XML
    const categoryXml = allCategories
      .map(cat => `<category>${cat.data.name}</category>`)
      .join('\n      ');

    const siteUrl = userSettings.siteUrl || context.site || 'https://example.com';
    const logoUrl = userSettings.logo ? `${siteUrl}${userSettings.logo}` : `${siteUrl}/og-image.jpg`;

    return rss({
      title: `${userSettings.siteName || 'My Blog'}`,
      description: userSettings.siteDescription || 'A blog built with Astro',
      site: siteUrl,
      items: rssItems,
      customData: `
        <language>en-US</language>
        <managingEditor>${userSettings.email || 'hello@example.com'} (${userSettings.author || 'Blog Owner'})</managingEditor>
        <webMaster>${userSettings.email || 'hello@example.com'} (${userSettings.author || 'Blog Owner'})</webMaster>
        ${categoryXml}
        <docs>https://www.rssboard.org/rss-specification</docs>
        <generator>Astro ${process.env.npm_package_version || 'v5.6.1'}</generator>
        <ttl>60</ttl>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <image>
          <url>${logoUrl}</url>
          <title>${userSettings.siteName || 'My Blog'}</title>
          <link>${siteUrl}</link>
          <description>${userSettings.siteDescription || 'A blog built with Astro'}</description>
          <width>144</width>
          <height>144</height>
        </image>
      `,
    });
  } catch (error) {
    console.error('RSS Generation Error:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}