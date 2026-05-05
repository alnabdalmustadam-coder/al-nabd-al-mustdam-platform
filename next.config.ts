import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: 'https://members.nabdtraining.com/',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: 'https://members.nabdtraining.com/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
