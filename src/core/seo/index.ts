// ==========================================
// FILE: src/core/seo/index.ts
// ==========================================
// Core SEO exports - all SEO logic centralized
export { generateAuthorSchemaData } from './generateAuthorSchema';
export { generateAuthorsListSchemaData } from './generateAuthorsListSchema';
export { generateBlogPostSchemaData } from './generateBlogPostSchema';
export { generateFAQSchema, generateFAQSchemaItems } from './generateFAQSchema';
export { default as Schema } from './Schema.astro';

// Re-export schema utility functions from local schema module
export {
  generatePersonSchema,
  generateArticleSchema,
  generateBlogPostingSchema,
  generateOrganizationSchema,
  generateImageSchema
} from './schema';

// Export types for theme builders
export type {
  AuthorData,
  BlogFrontmatter,
  BlogSchemaProps
} from './schema';

// Re-export SiteSettings from blogLogic for consistency
export type { SiteSettings } from '../blogLogic';
