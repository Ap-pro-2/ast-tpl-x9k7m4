#!/bin/bash

# Core Blog Logic and SEO Test Runner
# Comprehensive test suite for all core functionality

echo "🚀 Running Core Blog Logic and SEO Tests"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

# Check if vitest is available
if ! npm list vitest &> /dev/null; then
    print_error "vitest is not installed. Please run: npm install"
    exit 1
fi

print_status "Starting comprehensive test suite..."

# Run all tests with coverage
print_status "Running all tests with coverage report..."
npm run test:coverage

# Store the exit code
TEST_EXIT_CODE=$?

echo ""
echo "========================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed! ✅"
    echo ""
    print_status "Test Coverage Summary:"
    echo "- ✅ Blog Logic Functions (getAllPosts, getSiteSettings, etc.)"
    echo "- ✅ Pagination Logic (createPaginationData, generateBlogPaginationPaths)"
    echo "- ✅ Category Functions (getPostsByCategory, getCategoriesWithPostCounts)"
    echo "- ✅ Tag Functions (getPostsByTag, getTagsWithPostCounts)"
    echo "- ✅ Author Functions (getPostsByAuthor, getAuthorsWithPostCounts)"
    echo "- ✅ SEO Generation (generateBlogListingSEO, generateCategorySEO, etc.)"
    echo "- ✅ Schema Generation (generateArticleSchema, generatePersonSchema, etc.)"
    echo "- ✅ FAQ Schema Generation (generateFAQSchema, generateFAQSchemaItems)"
    echo "- ✅ FAQ Parser (parseFAQFromContent, validateFAQData)"
    echo "- ✅ Breadcrumb Utils (generateBreadcrumbs, getBlogPostBreadcrumbs, etc.)"
    echo "- ✅ Navigation Logic (all breadcrumb generation functions)"
    echo "- ✅ Error Handling and Edge Cases"
    echo "- ✅ Integration Tests"
    echo "- ✅ Performance Tests"
    echo ""
    print_success "Your blog logic and SEO functionality is solid! 🎉"
else
    print_warning "Some tests failed. Check the output above for details."
    echo ""
    print_status "Common issues and fixes:"
    echo "- Check mock data matches actual data structures"
    echo "- Verify function signatures haven't changed"
    echo "- Ensure all required dependencies are installed"
    echo "- Review error messages for specific failures"
    echo ""
    print_status "To run specific test files:"
    echo "- Blog Logic: npm test -- src/core/__tests__/blogLogic.test.ts"
    echo "- SEO Tests: npm test -- src/core/__tests__/seo.test.ts"
    echo "- FAQ Schema: npm test -- src/core/__tests__/faq-schema.test.ts"
    echo "- FAQ Parser: npm test -- src/core/__tests__/faq-parser.test.ts"
    echo "- Breadcrumbs: npm test -- src/core/__tests__/breadcrumb-utils.test.ts"
    echo ""
    print_status "To run tests in watch mode: npm run test:watch"
    print_status "To run tests with UI: npm run test:ui"
fi

echo ""
print_status "Test files location: src/core/__tests__/"
print_status "For more details, check: src/core/__tests__/README.md"

exit $TEST_EXIT_CODE