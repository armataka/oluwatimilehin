import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // project pages read their content at request time (to check the NDA cookie), so ship the content folder with them
  outputFileTracingIncludes: { '/work/[slug]': ['./content/**/*'] },
};

export default nextConfig;
