import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export interface UserProfile {
  address: string;
  username: string;
  email?: string;
  createdAt: number;
  lastLogin: number;
  privyUserId?: string;
}

export function useUser() {
  const { ready, authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user) {
      setProfile(null);
      return;
    }

    // Get wallet address from Privy user object
    const walletAddress = user.wallet?.address;
    if (!walletAddress) {
      console.log('No wallet address found');
      return;
    }

    // Register/update user profile
    registerUser(walletAddress);
  }, [ready, authenticated, user]);

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

  return {
    profile,
    loading,
    error,
    isAuthenticated: authenticated,
    walletAddress: user?.wallet?.address,
  };
}
