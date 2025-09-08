# AstroPress Forms System - Customizable Lead Capture

## Overview

This forms system provides a flexible, customizable lead capture solution that integrates seamlessly with the AstroPress dashboard. Similar to our ads system, it allows users to configure forms without touching code.

## Current Form Components

### 1. LeadForm.astro
- **Type**: Vertical form with email-only field
- **Best for**: Sidebar placements, compact spaces
- **Features**: 
  - Minimal design
  - Email validation
  - Source tracking
  - Theme-based styling

### 2. HorizontalForm.astro
- **Type**: Horizontal form with name and email fields
- **Best for**: Newsletter sections, full-width areas
- **Features**:
  - Side-by-side input layout
  - Name + email fields
  - Responsive design (stacks on mobile)
  - Theme-based styling with dynamic colors

## Form Placements & Sources

Current implemented placements:
- `section4-sidebar` - LeadForm in blog sidebar
- `section5-newsletter` - HorizontalForm in newsletter section
- `between-hero-and-content` - Available for header forms

## Making Forms Customizable (Like Ads System)

### 1. Form Configuration Structure

```typescript
// src/content/data/forms.json
{
  "forms": [
    {
      "id": "sidebar-lead",
      "type": "vertical", // or "horizontal"
      "placement": "section4-sidebar",
      "enabled": true,
      "fields": ["email"], // or ["name", "email"]
      "title": "Subscribe to Updates",
      "buttonText": "Subscribe Now",
      "styling": {
        "colorScheme": "primary", // primary, secondary, custom
        "customColors": {
          "button": "#ff6b6b",
          "buttonHover": "#ff5252"
        }
      },
      "settings": {
        "showTitle": true,
        "compactMode": false,
        "animationStyle": "slide-up"
      }
    },
    {
      "id": "newsletter-horizontal",
      "type": "horizontal",
      "placement": "section5-newsletter",
      "enabled": true,
      "fields": ["name", "email"],
      "title": "Get Subscribe To Our Latest News & Update",
      "buttonText": "Submit Now",
      "styling": {
        "colorScheme": "primary"
      }
    }
  ]
}
```

### 2. Form Logic System

```typescript
// src/core/formsLogic.ts
import formsData from '../content/data/forms.json';

export async function getFormsByPlacement(placement: string) {
  return formsData.forms.filter(form => 
    form.placement === placement && form.enabled
  );
}

export async function getFormConfig(formId: string) {
  return formsData.forms.find(form => form.id === formId);
}

export function generateFormStyles(styling: any) {
  // Generate CSS custom properties based on form config
  if (styling.colorScheme === 'custom') {
    return {
      '--form-button-bg': styling.customColors.button,
      '--form-button-hover': styling.customColors.buttonHover
    };
  }
  return {};
}
```

### 3. Universal Form Component

```astro
---
// src/components/forms/UniversalForm.astro
interface Props {
  formId: string;
  placement: string;
}

import { getFormConfig, generateFormStyles } from '../../core/formsLogic';
const { formId, placement } = Astro.props;
const config = await getFormConfig(formId);
const styles = generateFormStyles(config.styling);
---

{config && config.enabled && (
  <div class={`universal-form form-${config.type}`} style={styles}>
    {config.settings.showTitle && (
      <h3 class="form-title">{config.title}</h3>
    )}
    
    <form class={`form-${config.type} ${config.settings.compactMode ? 'compact' : ''}`}>
      {config.fields.includes('name') && (
        <input type="text" name="name" placeholder="Name" required />
      )}
      
      <input type="email" name="email" placeholder="Email" required />
      
      <button type="submit">{config.buttonText}</button>
      
      <input type="hidden" name="source" value={placement} />
    </form>
  </div>
)}
```

## Form Style Versions

### Version 1: Minimal (Current LeadForm)
- Single email field
- Compact vertical layout
- Minimal styling
- Perfect for sidebars

### Version 2: Newsletter (Current HorizontalForm)  
- Name + email fields
- Horizontal layout on desktop
- Rich styling with shadows
- Perfect for newsletter sections


