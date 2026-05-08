import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: 'https://register.nabdtraining.com/register-page',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: 'https://register.nabdtraining.com/register-page',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
