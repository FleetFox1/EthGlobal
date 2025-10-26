import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.lighthouse.storage',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },
  experimental: {
    turbo: {
      root: "../../",
    },
    // Don't bundle WASM files
    serverComponentsExternalPackages: [
      'bls-eth-wasm',
    ],
  },
  // For webpack-based builds (production)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle WASM modules on server side
      config.externals = config.externals || [];
      config.externals.push('bls-eth-wasm');
    }
    return config;
  },
};

export default nextConfig;
