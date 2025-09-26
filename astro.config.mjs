import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

import cloudflare from '@astrojs/cloudflare';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import fs from 'fs';

// Read settings from JSON file
const settingsData = JSON.parse(fs.readFileSync('./src/content/data/settings.json', 'utf-8'));
const siteSettings = settingsData[0];

// Read pages data for noindex control
const pagesData = JSON.parse(fs.readFileSync('./src/content/data/pages.json', 'utf-8'));

export default defineConfig({
  site: siteSettings.siteUrl,
  output: "server",
  adapter: cloudflare({
    imageService: 'cloudflare'
  }),

  // 🔐 Add environment schema for API security
  env: {
    schema: {
      // Secret API key for your blog APIs
      BLOG_API_KEY: envField.string({
        context: "server",
        access: "secret"
      }),
    }
  },

  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      defaultProps: {
        showCopyToClipboardButton: true,
        showLineNumbers: false,
      },
      styleOverrides: {
        frames: {
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabBorderColor: '#374151',
          editorTabBarBorderBottomColor: '#374151',
          tooltipSuccessBackground: '#10b981',
        },
        uiFontFamily: 'inherit',
        borderColor: '#374151',
        borderRadius: '0.75rem',
      },
      emitExternalStylesheet: true,
    }),
    mdx({
      gfm: true, // Enable GitHub Flavored Markdown for table support
      remarkPlugins: [],
      rehypePlugins: [],
    }),
    preact(),
    sitemap({
      filter: (page) => {
        // Always exclude API endpoints
        if (page.includes("/api/")) return false;

        // Check individual page noindex settings from pages.json
        const pageSlug = page.replace(siteSettings.siteUrl, '').replace(/\/$/, '') || '/';
        const pageData = pagesData.find(p => {
          const slug = p.slug === 'index' ? '/' : `/${p.slug}`;
          return slug === pageSlug;
        });

        // If page has noindex: true, exclude from sitemap
        if (pageData && pageData.noindex === true) return false;

        return true;
      },
      serialize: async (item) => {
        // Add lastmod field with proper ISO 8601 formatting as recommended by Bing
        try {
          const { getCollection } = await import('astro:content');

          // Get URL path relative to site
          const urlPath = item.url.replace(siteSettings.siteUrl, '').replace(/\/$/, '') || '/';

          if (urlPath === '/') {
            // Homepage - use current date
            item.lastmod = new Date().toISOString();
            return item;
          }

          // Get all blog posts and check if this URL matches a blog post
          const allPosts = await getCollection('blog');
          let matchingPost = null;

          // Extract slug from URL - handle both direct and prefixed routing
          let postSlug = '';
          if (urlPath.startsWith('/blog/')) {
            // Prefixed routing: /blog/post-slug
            postSlug = urlPath.replace('/blog/', '');
          } else if (urlPath.startsWith('/') &&
                     !urlPath.includes('/', 1) && // No additional slashes after the first one
                     !urlPath.startsWith('/categories') &&
                     !urlPath.startsWith('/tags') &&
                     !urlPath.startsWith('/authors') &&
                     !urlPath.startsWith('/about') &&
                     !urlPath.startsWith('/contact') &&
                     !urlPath.startsWith('/legal') &&
                     !urlPath.startsWith('/sitemap')) {
            // Direct routing: /post-slug
            postSlug = urlPath.substring(1); // Remove leading slash
          }

          // If we have a potential post slug, look for the matching post
          if (postSlug) {
            // Try exact match first, then with .mdx extension
            matchingPost = allPosts.find(post =>
              post.id === postSlug ||
              post.id === `${postSlug}.mdx` ||
              post.id.replace('.mdx', '') === postSlug
            );
          }

          if (matchingPost) {
            // Use lastmod if available, otherwise use pubDate
            const modDate = matchingPost.data.lastmod || matchingPost.data.pubDate;
            item.lastmod = modDate.toISOString();
          } else {
            // For other pages (categories, tags, authors, etc.), use current date
            // but normalize to avoid frequent changes
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            item.lastmod = today.toISOString();
          }

        } catch (error) {
          // Fallback in case of any errors
          const fallbackDate = new Date();
          fallbackDate.setHours(0, 0, 0, 0);
          item.lastmod = fallbackDate.toISOString();
        }

        return item;
      },
    })
  ],

  // 🚀 Performance optimizations for render blocking
  build: {
    // Force inline ALL stylesheets to eliminate render blocking
    inlineStylesheets: 'always', // Inline all CSS files regardless of size
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize asset inlining threshold - increase to inline more assets
      assetsInlineLimit: 16384, // 16KB threshold for inlining assets (4x default)
      // Optimize CSS code splitting
      cssCodeSplit: false, // Combine all CSS into single inline block
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['preact']
          }
        }
      }
    }
  },

  markdown: {
    syntaxHighlight: false,
    gfm: true, // Enable GitHub Flavored Markdown for table support
  },

  image: {
    domains: ["images.supplementcrew.com"],
    service: {
      entrypoint: 'astro/assets/services/cloudflare'
    }
  },
});
