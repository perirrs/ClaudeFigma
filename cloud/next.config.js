/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // better-sqlite3 is a native module; don't bundle it.
  experimental: { serverComponentsExternalPackages: ["better-sqlite3"] },
};
