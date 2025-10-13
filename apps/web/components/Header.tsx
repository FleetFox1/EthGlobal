'use client';

import { WalletButton } from '@/components/WalletButton';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-3 max-w-screen-xl mx-auto">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐛</span>
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            BugDex
          </span>
        </div>

        {/* Right: Wallet Button */}
        <WalletButton variant="compact" />
      </div>
    </header>
  );
}
