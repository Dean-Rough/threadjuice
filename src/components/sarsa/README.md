# Sarsa Template Components for ThreadJuice

This directory contains the essential Sarsa template components that have been adapted for ThreadJuice's Reddit-to-viral content platform.

## Structure

```
src/components/sarsa/
├── layout/
│   ├── Layout.tsx          # Main layout wrapper with multiple header/footer styles
│   ├── PageHead.tsx        # HTML head component with meta tags
│   ├── Breadcrumb.tsx      # Navigation breadcrumb component
│   ├── Header/
│   │   ├── Header1.tsx     # Primary header component
│   │   ├── Header2-7.js    # Additional header variations
│   │   ├── Menu.tsx        # Main navigation menu
│   │   ├── MobileMenu.tsx  # Mobile responsive menu
│   │   └── Sidebar.tsx     # Off-canvas sidebar
│   └── Footer/
│       ├── Footer1.tsx     # Primary footer (customized for ThreadJuice)
│       ├── Footer2.js      # Alternative footer styles
│       └── Footer3.js      # Additional footer variation
├── elements/
│   ├── BackToTop.tsx       # Scroll-to-top button
│   ├── ThemeSwitch.tsx     # Dark/light mode toggle
│   └── Preloader.js        # Page loading component
├── slider/
│   ├── TrendingSlider.tsx  # Swiper-based trending posts slider
│   └── PopularSlider.js    # Popular content slider
└── index.ts                # Component exports for easy imports
```

## Key Adaptations for ThreadJuice

### Content & Branding

- Updated logos to use ThreadJuice brand assets (`/assets/img/brand/`)
- Customized navigation menu for ThreadJuice-specific routes:
  - Categories: Technology, Lifestyle, Travel, Entertainment
  - Personas: Snarky Sage, Down-to-Earth Buddy, Dry Cynic
  - About page
- Modified footer links to reflect ThreadJuice features and content

### Navigation Structure

- **Categories**: `/category/[category]` - Content organized by topic
- **Personas**: `/personas/[id]` - Writer persona pages
- **Posts**: `/posts/[slug]` - Individual story pages
- **Dashboard**: `/dashboard` - User authentication area

### Theme System

- Maintained Sarsa's dark/light theme toggle
- ThemeSwitch component uses localStorage for persistence
- CSS classes: `light-theme` and `dark-theme`

### Responsive Design

- Mobile-first responsive navigation
- Swiper.js integration for touch-friendly sliders
- Bootstrap grid system maintained

## Assets Already Copied

### CSS & Styling

All essential Sarsa CSS files are in `/public/assets/css/`:

- `main.css` - Primary stylesheet
- `bootstrap.min.css` - Bootstrap framework
- `fontawesome-all.min.css` - Icon fonts
- `swiper-bundle.css` - Slider components
- Additional utility stylesheets

### SCSS Source Files

Complete SCSS structure in `/public/assets/scss/`:

- Component-specific styles
- Layout-specific styles
- Utility mixins and variables
- Color schemes and typography

### Fonts & Icons

- FontAwesome icons (all variants)
- Flaticon custom icon set
- Roboto font family via Bunny Fonts

### Images & Assets

- Background patterns and graphics
- Blog/content placeholder images
- Category-specific image collections
- Persona avatar placeholders in `/assets/img/personas/`

## Usage Examples

### Basic Layout

```tsx
import { Layout } from '@/components/sarsa';

export default function Page() {
  return (
    <Layout
      headerStyle={1}
      footerStyle={1}
      headTitle='ThreadJuice - Your Page Title'
    >
      <YourContent />
    </Layout>
  );
}
```

### Trending Slider

```tsx
import { TrendingSlider } from '@/components/sarsa';

export default function HomePage() {
  return (
    <section className='trending-section'>
      <TrendingSlider showItem={3} />
    </section>
  );
}
```

### Custom Header/Footer Combinations

```tsx
// Different header styles (1-7 available)
<Layout headerStyle={2} footerStyle={1}>

// With breadcrumbs
<Layout
  breadcrumbCategory="Technology"
  breadcrumbPostTitle="AI Revolution Story"
>
```

## Integration Notes

- All components are TypeScript-converted from original JavaScript
- Client-side components marked with `'use client'` directive
- Navigation uses Next.js App Router (`usePathname` instead of `useRouter`)
- Image paths updated to use ThreadJuice brand assets
- Mock data provided for development (replace with real API calls)

## Next Steps

1. **API Integration**: Replace mock data in sliders with real Reddit/GPT content
2. **Component Customization**: Adapt additional components as needed
3. **Theme Customization**: Modify SCSS variables for ThreadJuice brand colors
4. **Performance**: Optimize images and implement lazy loading
5. **Accessibility**: Ensure all components meet WCAG guidelines

## Dependencies

Required packages (should already be installed):

- `swiper` - For carousel/slider components
- `next` - For routing and navigation
- `react` - Core React functionality

The Sarsa template provides a solid foundation for ThreadJuice's content presentation layer while maintaining the viral, social media-friendly aesthetic needed for Reddit-sourced content.
