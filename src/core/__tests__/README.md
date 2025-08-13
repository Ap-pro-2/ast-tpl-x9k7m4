# Core Blog Logic Tests

This directory contains comprehensive unit tests for the core blog logic functions in `src/core/blogLogic.ts`.

## 🎯 Purpose

These tests ensure that:
- All core functions work correctly with various data scenarios
- Theme releases are solid and reliable
- Breaking changes are caught early
- New contributors can safely modify core logic

## 🧪 Test Coverage

### Content Functions
- ✅ `getAllPosts()` - Post retrieval and sorting
- ✅ `getPublishedPosts()` - Published-only filtering
- ✅ `getSiteSettings()` - Site configuration
- ✅ `getPageData()` - Page data retrieval

### Pagination Functions
- ✅ `createPaginationData()` - Pagination logic
- ✅ `generateBlogPaginationPaths()` - Static path generation

### Category Functions
- ✅ `getPostsByCategory()` - Category filtering
- ✅ `getCategoriesWithPostCounts()` - Category statistics
- ✅ `generateCategoryPaths()` - Category path generation

### Tag Functions
- ✅ `getPostsByTag()` - Tag filtering
- ✅ `getTagsWithPostCounts()` - Tag statistics
- ✅ `generateTagPaths()` - Tag path generation

### Author Functions
- ✅ `getPostsByAuthor()` - Author filtering
- ✅ `getAuthorsWithPostCounts()` - Author statistics
- ✅ `getAuthorTags()` - Author tag extraction
- ✅ `generateAuthorPaths()` - Author path generation

### SEO Functions
- ✅ `generateBlogListingSEO()` - Blog listing SEO
- ✅ `generateCategorySEO()` - Category page SEO
- ✅ `generateTagSEO()` - Tag page SEO
- ✅ `generateAuthorSEO()` - Author page SEO
- ✅ `generateHomepageSEO()` - Homepage SEO

### Schema Functions
- ✅ `generateBlogListingSchema()` - Structured data

### Utility Functions
- ✅ `generateShareURL()` - Social sharing URLs
- ✅ `getCurrentURL()` - URL construction
- ✅ `formatDate()` - Date formatting
- ✅ `calculateReadingTime()` - Reading time calculation
- ✅ `extractFrontmatter()` - Frontmatter extraction

### Integration & Error Handling
- ✅ Real-world data flow scenarios
- ✅ Edge cases (empty data, malformed data)
- ✅ Error handling and graceful degradation

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Only Core Logic Tests
```bash
npm test -- src/core/__tests__
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 📊 Test Structure

Each test follows this pattern:

```typescript
describe('Function Name', () => {
  it('should handle normal case', () => {
    // Test normal operation
  });

  it('should handle edge cases', () => {
    // Test empty data, null values, etc.
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

## 🔧 Mock Data

Tests use realistic mock data that mirrors your actual content structure:

- **Blog Posts**: With proper frontmatter, dates, authors, categories, tags
- **Categories**: With names, slugs, descriptions
- **Tags**: With names, slugs, descriptions  
- **Authors**: With names, bios, avatars
- **Settings**: Site configuration
- **Pages**: Page data with SEO info

## ✅ Quality Assurance

Before releasing any theme or making core changes:

1. **Run the full test suite**: `npm test`
2. **Check all tests pass**: Look for green checkmarks
3. **Review coverage**: Ensure new code is tested
4. **Test edge cases**: Verify empty states work
5. **Test integration**: Verify functions work together

## 🐛 Debugging Tests

If tests fail:

1. **Check the error message**: It will tell you exactly what failed
2. **Look at the test data**: Verify mock data matches expectations
3. **Run single test**: `npm test -- --grep "specific test name"`
4. **Use console.log**: Add logging to understand data flow
5. **Check mocks**: Ensure mocked functions return expected data

## 📝 Adding New Tests

When adding new functions to `blogLogic.ts`:

1. **Add test cases** for the new function
2. **Test normal operation** with typical data
3. **Test edge cases** (empty arrays, null values)
4. **Test error handling** (network failures, malformed data)
5. **Update this README** with the new test coverage

## 🎯 Best Practices

- **Test behavior, not implementation**: Focus on what functions do, not how
- **Use descriptive test names**: Make it clear what each test verifies
- **Keep tests isolated**: Each test should be independent
- **Mock external dependencies**: Don't rely on actual Astro collections
- **Test edge cases**: Empty data, malformed data, error conditions
- **Maintain test data**: Keep mock data realistic and up-to-date

## 🚨 Critical Tests

These tests are especially important for theme stability:

- **Pagination logic**: Ensures blog navigation works correctly
- **SEO generation**: Ensures proper meta tags and structured data
- **Content filtering**: Ensures drafts/published logic works
- **Path generation**: Ensures static site generation works
- **Data transformation**: Ensures UI components get correct data

Run these tests before every release! 🚀