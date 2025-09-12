// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle canvas module for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        "utf-8-validate": false,
        bufferutil: false,
      };
    }

    // Handle PDF.js worker and prevent canvas issues
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Ensure proper handling of PDF.js modules
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    return config;
  },
  // Ensure static file serving works properly
  async rewrites() {
    return [];
  },
  // Handle API routes properly
  async headers() {
    return [
      {
        source: "/api/pdf/:uuid",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
