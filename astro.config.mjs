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

  // 🔐 Add environment schema for Blog API security
  env: {
    schema: {
      // Secret API key for your blog APIs
      BLOG_API_KEY: envField.string({
        context: "server",
        access: "secret"
      })
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
