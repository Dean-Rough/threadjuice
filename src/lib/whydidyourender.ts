/// <reference types="@welldone-software/why-did-you-render" />

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const React = require('react');
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
    collapseGroups: true,
    include: [/.*PostCard.*/, /.*Quiz.*/, /.*TrendingFeed.*/],
    exclude: [/^Connect/, /^Router/],
  });
}