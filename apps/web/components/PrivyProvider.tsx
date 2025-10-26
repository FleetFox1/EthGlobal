'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { mainnet, sepolia, baseSepolia } from 'viem/chains';
import { createConfig } from 'wagmi';

// Configure wagmi for Ethereum chains
const config = createConfig({
  chains: [sepolia, baseSepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no Privy App ID is configured, show a helpful message
  if (!appId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="max-w-md p-6 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-500 mb-3">⚠️ Privy Not Configured</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To enable wallet connection, add your Privy App ID to <code className="px-1 py-0.5 bg-muted rounded text-xs">.env.local</code>
          </p>
          <ol className="text-xs text-muted-foreground space-y-2 mb-4 list-decimal list-inside">
            <li>Visit <a href="https://dashboard.privy.io/" target="_blank" className="text-blue-400 hover:underline">dashboard.privy.io</a></li>
            <li>Create a new app (free tier available)</li>
            <li>Copy your App ID</li>
            <li>Add to <code className="px-1 py-0.5 bg-muted rounded">apps/web/.env.local</code></li>
            <li>Restart the dev server</li>
          </ol>
          <div className="p-3 bg-muted rounded text-xs font-mono">
            NEXT_PUBLIC_PRIVY_APP_ID=your-app-id-here
          </div>
        </div>
      </div>
    );
  }

  return (
    <Privy
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
          logo: 'https://bugdex.life/logo.jpg',
        },
        loginMethods: ['wallet'],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Privy>
  );
}
