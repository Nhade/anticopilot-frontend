/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export (`out/`) — client-rendered SPA, no SSR. Deployed as
  // static assets on Cloudflare Pages; all data comes from the FastAPI backend
  // at runtime via NEXT_PUBLIC_API_URL.
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
