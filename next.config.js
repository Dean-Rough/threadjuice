/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (entries['main.js'] && !entries['main.js'].includes('./src/lib/whydidyourender.ts')) {
          entries['main.js'].unshift('./src/lib/whydidyourender.ts');
        }
        return entries;
      };
    }
    return config;
  },
}

module.exports = nextConfig