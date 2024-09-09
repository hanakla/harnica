const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpileModules: ["date-fns"],
  i18n: {
    defaultLocale: "ja",
    locales: ["en", "ja"],
  },
  experimental: {
    appDir: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = withMDX(nextConfig);
