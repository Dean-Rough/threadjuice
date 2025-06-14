// Test that dependencies can be imported without errors
describe('Sarsa Dependencies Integration', () => {
  it('can import TypewriterAnimation component', async () => {
    const componentModule = await import(
      '@/components/elements/TypewriterAnimation'
    );
    expect(componentModule.TypewriterAnimation).toBeDefined();
    expect(typeof componentModule.TypewriterAnimation).toBe('function');
  });

  it('can import WOWAnimation component', async () => {
    const componentModule = await import('@/components/elements/WOWAnimation');
    expect(componentModule.WOWAnimation).toBeDefined();
    expect(typeof componentModule.WOWAnimation).toBe('function');
  });

  it('can import FastMarquee component', async () => {
    const componentModule = await import('@/components/elements/FastMarquee');
    expect(componentModule.FastMarquee).toBeDefined();
    expect(typeof componentModule.FastMarquee).toBe('function');
  });

  it('can import IsotopeFilter component', async () => {
    const componentModule = await import('@/components/elements/IsotopeFilter');
    expect(componentModule.IsotopeFilter).toBeDefined();
    expect(typeof componentModule.IsotopeFilter).toBe('function');
  });

  it('can import ModalVideo component', async () => {
    const componentModule = await import('@/components/elements/ModalVideo');
    expect(componentModule.default).toBeDefined();
    expect(typeof componentModule.default).toBe('function');
  });

  it('verifies SCSS support is configured', () => {
    // Check that sass dependency is installed
    const packageJson = require('../../../../package.json');
    expect(packageJson.devDependencies.sass).toBeDefined();
  });

  it('verifies all required Sarsa dependencies are installed', () => {
    const packageJson = require('../../../../package.json');

    // Check devDependencies
    expect(packageJson.devDependencies['isotope-layout']).toBeDefined();
    expect(packageJson.devDependencies['react-fast-marquee']).toBeDefined();
    expect(packageJson.devDependencies['sass']).toBeDefined();
    expect(packageJson.devDependencies['typewriter-effect']).toBeDefined();
    expect(packageJson.devDependencies['wowjs']).toBeDefined();

    // Check dependencies
    expect(packageJson.dependencies['react-modal-video']).toBeDefined();
    expect(packageJson.dependencies['swiper']).toBeDefined();
  });
});
