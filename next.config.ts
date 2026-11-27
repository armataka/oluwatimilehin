import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // STANDALONE=1 builds a self-contained server, used to check that nothing is missing before deploying
  output: process.env.STANDALONE ? 'standalone' : undefined,
  // project pages read their content at request time (to check the NDA cookie), so ship the content folder with them
  outputFileTracingIncludes: { '/**/*': ['./content/**/*'] },
};

export default nextConfig;
