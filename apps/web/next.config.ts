import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: "../../",
    },
    // Don't bundle WASM files
    serverComponentsExternalPackages: ['bls-eth-wasm'],
  },
  // For webpack-based builds (production)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle bls-eth-wasm on server side
      config.externals = config.externals || [];
      config.externals.push('bls-eth-wasm');
    }
    return config;
  },
};

export default nextConfig;
