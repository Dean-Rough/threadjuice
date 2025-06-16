# Sarsa Template Integration Guide

## Overview

ThreadJuice is built on the **Sarsa Next.js Template**, a premium magazine/news template with multiple layouts and modern animations. This document outlines our template-first development approach.

## Integration Strategy

### Core Principle: Use ACTUAL Template Pages

Instead of recreating components, we copy and adapt the actual Sarsa template pages:

1. **Copy Template Pages** - Use Sarsa page files as starting points
2. **App Router Compatibility** - Add necessary directives and imports
3. **Content Adaptation** - Replace Sarsa content with ThreadJuice themes
4. **Brand Integration** - Replace logos and styling while keeping layouts

## Template Structure

### Source Template Location
```
/Users/deannewton/Documents/ThreadJuice/sarsa-nextjs-v2.0-unzip-first/1.Sarsa-Nextjs/
```

### Available Template Pages
- `pages/index-1.js` through `pages/index-8.js` - Different homepage layouts
- `pages/blog.js` - Blog archive/listing page
- `pages/blog/[id].js` - Individual blog post page  
- `pages/contact.js` - Contact form page
- `pages/about.js` - About page
- `pages/portfolio.js` - Portfolio/gallery page

## Integration Process

### Step 1: Copy Template Page
```bash
# Copy the Sarsa page content to our App Router structure
cp sarsa/pages/index-6.js src/app/page.tsx
```

### Step 2: App Router Compatibility

Add required directives and imports:

```typescript
'use client'; // Required for pages using React hooks

// Update router imports
import { usePathname } from 'next/navigation'; // App Router
// Remove: import { useRouter } from 'next/router'; // Pages Router

const pathname = usePathname(); // App Router API
```

### Step 3: Component Compatibility

Update components that use React hooks:

```typescript
// Add to component files using hooks
'use client';

import { useEffect, useState } from 'react';
```

### Step 4: Content Adaptation

Replace Sarsa content with ThreadJuice themes:

```typescript
// Original Sarsa content
title: "Breaking: Tech Industry News"
author: "John Doe"

// ThreadJuice adaptation  
title: "AITA for telling my roommate her TikTok dances are ruining my Zoom calls?"
author: "The Snarky Sage"
```

### Step 5: Branding Integration

Replace logos and brand elements:

```typescript
// Replace Sarsa logos with ThreadJuice SVG logos
<img src="/assets/img/logo/lockup.svg" alt="ThreadJuice" />

// Update brand colors and styling as needed
```

## Successfully Integrated Pages

### Homepage (`app/page.tsx`)
- **Source**: `sarsa/pages/index-6.js`
- **Features**: Hero carousel, trending posts, sidebar
- **Adaptations**: ThreadJuice content themes, persona integration

### Blog List (`app/blog/page.tsx`)  
- **Source**: `sarsa/pages/blog.js`
- **Features**: Post grid, pagination, social sharing
- **Adaptations**: Reddit story themes, persona authors

### Blog Detail (`app/blog/[slug]/page.tsx`)
- **Source**: `sarsa/pages/blog/[id].js`
- **Features**: Article layout, sidebar, social sharing
- **Adaptations**: ThreadJuice content, persona integration

### Personas (`app/personas/page.tsx`)
- **Source**: Custom using Sarsa layout patterns
- **Features**: Writer bio cards, category filtering
- **Adaptations**: AI persona themes, satirical content

## CSS and Dependencies

### Sarsa CSS Import Chain
```css
/* globals.css - Full Sarsa styling imported */
@import '/assets/css/bootstrap.min.css';
@import '/assets/css/fontawesome-all.min.css';
@import '/assets/css/flaticon.css';
@import '/assets/css/animate.min.css';
@import '/assets/css/slick.css';
@import '/assets/css/magnific-popup.css';
@import '/assets/css/swiper-bundle.css';
@import '/assets/css/imageRevealHover.css';
@import '/assets/css/main.css';
```

### Required Dependencies
```json
{
  "swiper": "^11.2.8",
  "isotope-layout": "^3.0.6", 
  "react-modal-video": "^2.0.2",
  "react-fast-marquee": "^1.6.5",
  "typewriter-effect": "^2.22.0",
  "wowjs": "^1.1.3",
  "sass": "^1.89.2"
}
```

## Common Integration Issues

### React Hooks Error
```
Error: useEffect/useState only works in client component
```
**Solution**: Add `'use client';` directive to component

### Router Mounting Error  
```
Error: NextRouter not mounted
```
**Solution**: Replace `useRouter()` with `usePathname()` from `next/navigation`

### CSS Not Loading
```
Issue: Components render but styling missing
```
**Solution**: Import all Sarsa CSS files in `globals.css`

### Module Type Warning
```
Warning: [MODULE_TYPELESS_PACKAGE_JSON]
```
**Solution**: Add `"type": "module"` to `package.json`

## Future Template Pages

Additional Sarsa pages available for integration:

- **index-1.js**: Minimal hero layout
- **index-2.js**: Featured post carousel  
- **index-3.js**: Grid-based homepage
- **index-4.js**: Magazine-style layout
- **index-5.js**: Video-focused homepage
- **index-7.js**: Social media style
- **index-8.js**: Tech blog layout
- **contact.js**: Contact form with map
- **about.js**: Team/company info page
- **portfolio.js**: Gallery/showcase page

## Best Practices

### Template-First Development
1. **Start with Sarsa pages** - Don't recreate layouts from scratch
2. **Minimal modifications** - Keep Sarsa structure intact when possible  
3. **Content over UI** - Focus on adapting content themes rather than UI changes
4. **Brand integration only** - Replace logos, colors, content themes only

### App Router Compatibility
1. **Always add "use client"** for pages using React hooks
2. **Update router imports** - Use App Router APIs consistently
3. **Test immediately** - Verify page loads without errors after integration

### Content Adaptation
1. **Maintain layout structure** - Keep Sarsa's grid and component structure
2. **Replace content themes** - Adapt for Reddit/viral content focus
3. **Persona integration** - Replace authors with ThreadJuice personas
4. **Brand consistency** - Use ThreadJuice logos and colors throughout

## Development Workflow

```bash
# 1. Choose Sarsa template page
ls sarsa-nextjs-v2.0-unzip-first/1.Sarsa-Nextjs/pages/

# 2. Copy to App Router location  
cp sarsa/pages/target-page.js src/app/new-page/page.tsx

# 3. Add App Router compatibility
# - Add 'use client' directive
# - Update router imports
# - Fix component imports

# 4. Adapt content for ThreadJuice
# - Replace Sarsa content with Reddit themes
# - Integrate personas
# - Update branding

# 5. Test and verify
npm run dev
```

This template-first approach allows us to leverage Sarsa's professional design while rapidly building ThreadJuice-specific functionality.