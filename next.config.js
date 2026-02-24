/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow pdfjs-dist worker files
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
