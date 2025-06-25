#!/usr/bin/env node

/**
 * Bundle Analysis Script for ThreadJuice
 * Analyzes the Next.js bundle and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ThreadJuice Bundle Analysis');
console.log('================================\n');

// Check if build exists
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run `npm run build` first.');
  process.exit(1);
}

// Analyze package.json dependencies
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

console.log('📦 Key Dependencies Analysis:');
console.log(`- Next.js: ${packageJson.dependencies?.next || 'Not found'}`);
console.log(`- React: ${packageJson.dependencies?.react || 'Not found'}`);
console.log(
  `- React Query: ${packageJson.dependencies?.['@tanstack/react-query'] || 'Not found'}`
);
console.log(
  `- Lucide React: ${packageJson.dependencies?.['lucide-react'] || 'Not found'}\n`
);

// Check for heavy dependencies
const heavyDeps = [
  '@sentry/nextjs',
  '@clerk/nextjs',
  'framer-motion',
  'three',
  'chart.js',
  'moment',
  'lodash',
];

console.log('⚠️  Heavy Dependencies Found:');
heavyDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    console.log(
      `- ${dep}: ${packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]}`
    );
  }
});

// Analyze build artifacts
const buildInfoPath = path.join(buildDir, 'build-manifest.json');
if (fs.existsSync(buildInfoPath)) {
  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
  console.log('\n📊 Build Analysis:');
  console.log(`- Pages built: ${Object.keys(buildInfo.pages).length}`);
} else {
  console.log('\n📊 Build manifest not found');
}

console.log('\n🚀 Performance Recommendations:');
console.log('1. Update @tanstack/react-query to v5 for better performance');
console.log(
  '2. Consider code splitting for large components (SimplePostDetail.tsx)'
);
console.log('3. Implement proper image optimization with responsive sizes');
console.log('4. Add React.memo() to frequently re-rendering components');
console.log('5. Use dynamic imports for heavy features');

console.log('\n💡 Quick Wins:');
console.log('- Enable Next.js experimental optimizeCss');
console.log('- Add bundle analyzer to package.json');
console.log('- Implement proper memoization in data fetching hooks');
console.log('- Remove dev-only dependencies from production bundle');
