/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    GEMINI_API_KEY: "AIzaSyDfJ4ZDvYDsC4Cq8lksklgFJDIzpwKgyxk",
  },
};

export default nextConfig;
