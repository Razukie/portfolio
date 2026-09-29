/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Build to plain static files in /out so the site can be hosted on GitHub Pages
  output: "export",
  // GitHub Pages serves this repo at /portfolio; empty for local development
  basePath,
  // Pages has no image-optimisation server, so serve images as-is
  images: { unoptimized: true },
};

export default nextConfig;
