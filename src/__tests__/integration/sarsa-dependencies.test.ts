/**
 * Integration test for Sarsa template dependencies
 * Tests that all dependencies can be imported and configured correctly
 */
describe('Sarsa Dependencies Integration', () => {
  it('can import isotope-layout', async () => {
    const Isotope = await import('isotope-layout');
    expect(Isotope.default).toBeDefined();
  });

  it('can import react-fast-marquee', async () => {
    const Marquee = await import('react-fast-marquee');
    expect(Marquee.default).toBeDefined();
  });

  it('can import typewriter-effect', async () => {
    const Typewriter = await import('typewriter-effect');
    expect(Typewriter.default).toBeDefined();
  });

  it('can import wowjs', async () => {
    const WOW = await import('wowjs');
    expect(WOW.WOW).toBeDefined();
  });

  it('can import swiper package', () => {
    // Just verify the package is installed
    const packageJson = require('../../../package.json');
    expect(packageJson.dependencies['swiper']).toBeDefined();
  });

  it('can import sass (via next.js config)', () => {
    const nextConfig = require('../../../next.config.js');
    expect(nextConfig.sassOptions).toBeDefined();
    expect(nextConfig.sassOptions.includePaths).toContain('./src');
    expect(nextConfig.sassOptions.includePaths).toContain('./public');
  });

  it('verifies package.json has all required dependencies', () => {
    const packageJson = require('../../../package.json');
    
    // Check devDependencies (most Sarsa deps are dev dependencies)
    expect(packageJson.devDependencies['isotope-layout']).toBeDefined();
    expect(packageJson.devDependencies['react-fast-marquee']).toBeDefined();
    expect(packageJson.devDependencies['sass']).toBeDefined();
    expect(packageJson.devDependencies['typewriter-effect']).toBeDefined();
    expect(packageJson.devDependencies['wowjs']).toBeDefined();
    
    // Check main dependencies
    expect(packageJson.dependencies['swiper']).toBeDefined();
    expect(packageJson.dependencies['react-modal-video']).toBeDefined();
  });

  it('verifies SCSS assets are available', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check that Sarsa SCSS files exist
    const scssDir = path.join(process.cwd(), 'public/assets/scss');
    expect(fs.existsSync(scssDir)).toBe(true);
    
    const utilsDir = path.join(scssDir, 'utils');
    expect(fs.existsSync(utilsDir)).toBe(true);
    
    const indexFile = path.join(utilsDir, '_index.scss');
    expect(fs.existsSync(indexFile)).toBe(true);
  });
});