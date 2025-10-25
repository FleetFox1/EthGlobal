'use client';

import { useWallet } from '@/lib/useWallet';
import { useUser } from '@/lib/useUser';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletButtonProps {
  variant?: 'default' | 'compact';
}

export function WalletButton({ variant = 'default' }: WalletButtonProps) {
  const { isReady, isConnected, address, connect, disconnect } = useWallet();
  const { profile, loading: userLoading } = useUser();
  const router = useRouter();

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
    // Try to get avatar from profile.avatarUrl first, fallback to IPFS profile
    const avatarUrl = profile?.avatarUrl || 
      (profile?.ipfsProfile?.avatar 
        ? `https://gateway.lighthouse.storage/ipfs/${profile.ipfsProfile.avatar}`
        : null);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`${variant === 'compact' ? 'px-3 py-1.5 h-9' : 'px-4 py-2.5 h-10'} bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:text-green-500`}
          >
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="h-5 w-5 rounded-full object-cover border border-green-500/30"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>
                {userLoading ? (
                  'Loading...'
                ) : profile ? (
                  profile.username
                ) : (
                  `${address.slice(0, 6)}...${address.slice(-4)}`
                )}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-500 focus:text-red-500">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
