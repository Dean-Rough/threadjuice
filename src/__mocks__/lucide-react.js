import React from 'react';

// Mock all lucide-react icons as simple SVG elements
const MockIcon = ({ className, ...props }) => 
  React.createElement('svg', { 
    className, 
    'data-testid': 'mock-icon',
    width: 24,
    height: 24,
    ...props 
  });

// Export commonly used icons
export const Loader = MockIcon;
export const Loader2 = MockIcon;
export const RefreshCw = MockIcon;
export const Zap = MockIcon;
export const ArrowUp = MockIcon;
export const MessageCircle = MockIcon;
export const Bookmark = MockIcon;
export const Share2 = MockIcon;
export const Eye = MockIcon;
export const Clock = MockIcon;
export const Calendar = MockIcon;
export const User = MockIcon;
export const Search = MockIcon;
export const Menu = MockIcon;
export const X = MockIcon;
export const ChevronDown = MockIcon;
export const ChevronUp = MockIcon;
export const ChevronLeft = MockIcon;
export const ChevronRight = MockIcon;
export const Star = MockIcon;
export const Heart = MockIcon;
export const Edit = MockIcon;
export const Trash = MockIcon;
export const Plus = MockIcon;
export const Minus = MockIcon;

// Default export for any icon not specifically listed
export default MockIcon;

// Create a proxy to handle any other icon names dynamically
const iconProxy = new Proxy({}, {
  get: function(target, prop) {
    if (typeof prop === 'string' && prop !== 'default') {
      return MockIcon;
    }
    return target[prop];
  }
});

// Export everything through the proxy
module.exports = iconProxy;