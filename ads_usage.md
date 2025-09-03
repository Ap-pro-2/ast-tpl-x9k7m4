# Advertising Usage Guide

This document outlines where the advertisements defined in `src/content/data/ads.json` are used throughout the codebase.

## Recent Updates

The ads system has been upgraded to use Astro's content collections with full type safety and async support. All ad functions now require `await` when called.

### Smart Development Placeholders
- Development placeholders now only appear when ads are globally enabled but misconfigured
- When `global.enabled: false`, no placeholders are shown (clean development environment)
- This provides targeted debugging without cluttering the interface when ads are intentionally disabled

## Ad Placements

The following ad placements are configured in `src/content/data/ads.json`:

*   `between-hero-and-content`
*   `ad-section-2-sidebar`
*   `ad-section-2-horizontal`
*   `article-content`
*   `article-sidebar`
*   `homepage-between-posts`
*   `categories-sidebar`
*   `tags-sidebar`

### Ad Component

The primary component used to render banner ads is `src/components/ads/SimpleBannerAd.astro`.

### Placement Implementations

Here is a breakdown of where each ad placement is used:

*   **`between-hero-and-content`**:
    *   **File**: `src/pages/index.astro`
    *   **Details**: This ad is displayed in a standalone ad section on the homepage, between the hero and the main content.

*   **`ad-section-2-horizontal`**:
    *   **File**: `src/components/layout/MagazineSections.astro`
    *   **Details**: This ad is displayed as a horizontal banner within the "Today's Hot Spot" section of the magazine layout.

*   **`ad-section-2-sidebar`**:
    *   **File**: `src/components/layout/MagazineSections.astro`
    *   **Details**: This ad is displayed in the sidebar of the magazine sections.

*   **`article-content`**:
    *   **File**: `src/layouts/MarkdownPostLayout.astro`
    *   **Details**: This ad is displayed after the main article content.

*   **`article-sidebar`**:
    *   **File**: `src/layouts/MarkdownPostLayout.astro`
    *   **Details**: This ad is displayed on article pages in the sidebar.

*   **`homepage-between-posts`**:
    *   **File**: `src/pages/index.astro`
    *   **Details**: This ad is displayed on the homepage between blog posts.

*   **`categories-sidebar`**:
    *   **File**: `src/pages/categories/index.astro`
    *   **Details**: This ad is displayed on the category listing page sidebar.

*   **`tags-sidebar`**:
    *   **File**: `src/pages/tags/index.astro`
    *   **Details**: This ad is displayed on the tag listing page sidebar.

### Unused Placements

All ad placements defined in `src/content/data/ads.json` are accounted for in the codebase.

---

## Technical Implementation Details

### Content Collection Structure

The `ads.json` file is now structured as an array for content collection compatibility:

```json
[
  {
    "id": "main",
    "global": {
      "enabled": true,
      "testMode": true
    },
    "banners": [
      // Banner configurations...
    ]
  }
]
```

### API Usage Examples

All ads functions are now async and must be awaited:

```typescript
// Check if ads are enabled
const enabled = await areAdsEnabled();

// Get banners for a placement
const banners = await getBannersByPlacement('homepage-between-posts');

// Get specific banner by ID  
const banner = await getBannerById('between-hero-and-content-banner');

// Check if placement has ads
const hasAds = await hasAdsForPlacement('article-sidebar');
```

### Component Usage

In Astro components, use await in the frontmatter:

```astro
---
import { areAdsEnabled, getBannersByPlacement } from '../core/adsLogic';

const adsEnabled = await areAdsEnabled();
const banners = await getBannersByPlacement('homepage-between-posts');
---

{adsEnabled && banners.length > 0 && (
  <!-- Render ads -->
)}
```

### Schema Validation

The system includes comprehensive Zod validation in `src/content/config.ts` with support for:

- Banner priority (1-10)
- Date scheduling (startDate/endDate)
- Impression/click limits
- Audience targeting
- Placement validation