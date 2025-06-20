// AdSense Components for ThreadJuice
// Optimized for viral content monetization with UX-first approach

export { default as AdSenseUnit } from './AdSenseUnit';
export { default as HeaderAd } from './HeaderAd';
export { default as SidebarAd } from './SidebarAd';
export { default as InlineAd } from './InlineAd';
export { default as FeedAd } from './FeedAd';

// Ad placement utilities
export const AD_POSITIONS = {
  HEADER: 'header',
  SIDEBAR: 'sidebar',
  INLINE_STORY: 'inline-story',
  FEED: 'feed',
  FOOTER: 'footer',
} as const;

export type AdPosition = (typeof AD_POSITIONS)[keyof typeof AD_POSITIONS];
