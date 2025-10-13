"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export interface UserProfile {
  address: string;
  username: string;
  email?: string;
  createdAt: number;
  lastLogin: number;
  privyUserId?: string;
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  walletAddress: string | undefined;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  walletAddress: undefined,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRegistered = useRef(false);
  const walletAddress = user?.wallet?.address;

  useEffect(() => {
    if (!ready || !authenticated || !user || !walletAddress) {
      setProfile(null);
      hasRegistered.current = false;
      return;
    }

    // Only register once per session
    if (hasRegistered.current) {
      return;
    }

    hasRegistered.current = true;
    registerUser(walletAddress);
  }, [ready, authenticated, walletAddress]);

  const registerUser = async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Registering user:', address);

      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          email: user?.email?.address,
          privyUserId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data.user);
        console.log(
          data.data.isNewUser ? '✅ New user registered!' : '✅ User logged in!',
          data.data.user.username
        );
      } else {
        setError(data.error || 'Failed to register user');
      }
    } catch (err: any) {
      console.error('❌ Error registering user:', err);
      setError(err.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        error,
        isAuthenticated: authenticated,
        walletAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
