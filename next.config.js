// /** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  // Configure for better Vercel compatibility
  poweredByHeader: false,

  // Increase body size limits for file uploads
  serverRuntimeConfig: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
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

  // Handle API routes properly with appropriate headers
  async headers() {
    return [
      {
        // Handle CORS and content type for API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      {
        // PDF serving with proper cache headers
        source: "/api/pdf/:uuid",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Environment variables for runtime
  env: {
    CUSTOM_KEY: "pdf-annotator",
  },

  // Optimize for production
  compress: true,

  // Images configuration (if you add images later)
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },

  // Redirects if needed
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        has: [
          {
            type: "cookie",
            key: "token",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
