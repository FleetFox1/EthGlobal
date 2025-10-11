'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';

export function useWallet() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  // Get the primary wallet
  const wallet = wallets[0];
  const address = wallet?.address || user?.wallet?.address;

  return {
    isReady: ready,
    isConnected: authenticated,
    address,
    wallet,
    connect: login,
    disconnect: logout,
    user,
  };
}
