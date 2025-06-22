/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to fix duplicate rendering

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Changed from DENY to allow embeds
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "frame-ancestors 'self'",
              "frame-src 'self' https://www.tiktok.com https://platform.twitter.com https://www.youtube.com https://www.youtube-nocookie.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://www.google-analytics.com",
              "img-src 'self' data: https: http:",
              "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.threadjuice.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Note: telemetry disabled via NEXT_TELEMETRY_DISABLED env var

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-separator'],
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
