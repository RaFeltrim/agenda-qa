/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // Docker/Vercel optimization
    compiler: {
          removeConsole: process.env.NODE_ENV === "production",
    },
    experimental: {
          optimizePackageImports: ['antd', '@ant-design/icons', 'lodash'],
    },
    // Fix for potential Supabase/Node resolution issues
    webpack: (config) => {
          config.resolve.fallback = { fs: false, net: false, tls: false };
          return config;
    },
};

module.exports = nextConfig;
