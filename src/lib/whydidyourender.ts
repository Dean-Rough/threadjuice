// /// <reference types="@welldone-software/why-did-you-render" />

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const React = require('react');
  const whyDidYouRender = require('@welldone-software/why-did-you-render');

  whyDidYouRender(React, {
    trackAllPureComponents: false,
    trackHooks: true,
    logOwnerReasons: true,
    collapseGroups: true,
    include: [
      // Add component names you want to track
      // Example: /^MyComponent$/
    ],
    exclude: [
      // Exclude noisy components
      /^NextScript$/,
      /^Head$/,
      /^Document$/,
    ],
  });
}

export {};
