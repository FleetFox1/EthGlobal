'use client';

import { useWallet } from '@/lib/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

interface WalletButtonProps {
  variant?: 'default' | 'compact';
}

export function WalletButton({ variant = 'default' }: WalletButtonProps) {
  const { isReady, isConnected, address, connect, disconnect } = useWallet();

  if (!isReady) {
    return (
      <Button 
        variant="outline" 
        className={variant === 'compact' ? '' : 'w-full'} 
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${variant === 'compact' ? 'px-3 py-1.5' : 'flex-1 px-4 py-2.5'} bg-green-500/10 text-green-500 text-sm font-medium rounded-md border border-green-500/20 text-center`}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={disconnect}
          className={variant === 'compact' ? 'h-9 w-9' : 'h-10 w-10'}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={connect} 
      className={variant === 'compact' ? 'gap-2' : 'w-full gap-2 h-12'}
    >
      <Wallet className={variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
      Connect Wallet
    </Button>
  );
}
