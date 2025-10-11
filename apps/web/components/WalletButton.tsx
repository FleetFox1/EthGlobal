'use client';

import { useWallet } from '@/lib/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function WalletButton() {
  const { isReady, isConnected, address, connect, disconnect } = useWallet();

  if (!isReady) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Loading...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2.5 bg-green-500/10 text-green-500 text-sm font-medium rounded-md border border-green-500/20 text-center">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={disconnect}
          className="h-10 w-10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} className="w-full gap-2 h-12">
      <Wallet className="h-5 w-5" />
      Connect Wallet
    </Button>
  );
}
