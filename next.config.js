/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Turbopack for faster development builds
  experimental: {
    turbo: {
      rules: {
        '*.scss': {
          loaders: ['sass-loader'],
          as: '*.css',
        },
      },
    },
  },
  sassOptions: {
    includePaths: ['./src', './public'],
    prependData: `@import "public/assets/scss/utils/_index.scss";`,
  },
  // Note: whydidyourender disabled for Turbopack compatibility
  // Can be re-enabled if needed by switching back to Webpack
};

module.exports = nextConfig;
