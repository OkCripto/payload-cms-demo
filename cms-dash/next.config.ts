import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      // "/" is an empty page — everything lives under /admin.
      destination: '/admin',
      permanent: false,
      source: '/',
    },
  ],
};

export default withPayload(nextConfig);
