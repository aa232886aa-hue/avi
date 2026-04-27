import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // הסרנו כל הגדרה של eslint או experimental כי הן גורמות לשגיאות בגרסה 16
};

export default nextConfig;
