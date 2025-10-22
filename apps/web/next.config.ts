import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: "../../",
    },
    // Don't bundle WASM files and native modules
    serverComponentsExternalPackages: [
      'bls-eth-wasm',
      '@lighthouse-web3/sdk',
      'fs-extra',
    ],
  },
  // For webpack-based builds (production)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these modules on server side
      config.externals = config.externals || [];
      config.externals.push('bls-eth-wasm', '@lighthouse-web3/sdk', 'fs-extra');
    }
    return config;
  },
};

export default nextConfig;
