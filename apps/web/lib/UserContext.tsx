"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { profileRegistryAddress } from './contracts';
import { 
  UserProfile as IPFSUserProfile,
  uploadProfile,
  uploadAvatar as uploadAvatarToIPFS,
  fetchProfile
} from './ipfs';

export interface UserProfile {
  address: string;
  username: string;
  email?: string;
  createdAt: number;
  lastLogin: number;
  privyUserId?: string;
  avatarUrl?: string;
  bio?: string;
  // IPFS profile data
  ipfsProfile?: IPFSUserProfile;
  ipfsHash?: string;
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  walletAddress: string | undefined;
  // IPFS profile functions
  updateProfile: (profileData: IPFSUserProfile) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
  isUpdatingProfile: boolean;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  walletAddress: undefined,
  updateProfile: async () => {},
  uploadAvatar: async () => '',
  refreshProfile: async () => {},
  isUpdatingProfile: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const hasRegistered = useRef(false);
  const walletAddress = user?.wallet?.address;

  // Read IPFS hash from ProfileRegistry contract
  const { data: ipfsHash, refetch: refetchHash } = useReadContract({
    address: profileRegistryAddress as `0x${string}`,
    abi: [
      {
        name: 'getProfile',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'string' }],
      },
    ],
    functionName: 'getProfile',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!walletAddress,
    },
  });

  // Write contract hook for updating profile
  const { writeContract, data: txHash } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch IPFS profile data when hash changes
  useEffect(() => {
    if (ipfsHash && typeof ipfsHash === 'string' && ipfsHash.length > 0) {
      fetchIPFSProfile(ipfsHash as string);
    }
  }, [ipfsHash]);

  // Refetch profile after successful transaction
  useEffect(() => {
    if (isTxSuccess) {
      console.log('✅ Profile updated on-chain, refetching...');
      refetchHash();
      setIsUpdatingProfile(false);
    }
  }, [isTxSuccess]);

  const fetchIPFSProfile = async (hash: string) => {
    try {
      console.log('📥 Fetching profile from IPFS:', hash);
      const ipfsProfile = await fetchProfile(hash);
      
      if (ipfsProfile && profile) {
        setProfile({
          ...profile,
          ipfsProfile,
          ipfsHash: hash,
        });
      }
    } catch (err) {
      console.error('❌ Error fetching IPFS profile:', err);
    }
  };

  const updateProfile = async (profileData: IPFSUserProfile) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    setIsUpdatingProfile(true);
    setError(null);

    try {
      console.log('📤 Uploading profile to IPFS...');
      
      // Upload profile to IPFS via API route
      const newIpfsHash = await uploadProfile(profileData, walletAddress);
      console.log('✅ Profile uploaded:', newIpfsHash);

      // Update on-chain registry
      console.log('📝 Updating on-chain registry...');
      writeContract({
        address: profileRegistryAddress as `0x${string}`,
        abi: [
          {
            name: 'setProfile',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'ipfsHash', type: 'string' }],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'setProfile',
        args: [newIpfsHash],
      });

      // Note: Transaction confirmation handled by useEffect
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      setIsUpdatingProfile(false);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      console.log('📤 Uploading avatar to IPFS...');
      const avatarHash = await uploadAvatarToIPFS(file);
      console.log('✅ Avatar uploaded:', avatarHash);
      return avatarHash;
    } catch (err: any) {
      console.error('❌ Error uploading avatar:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (ipfsHash && typeof ipfsHash === 'string') {
      await fetchIPFSProfile(ipfsHash as string);
    }
    await refetchHash();
  };

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

      // First, register/fetch basic user profile from API
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
        const basicProfile = data.data.user;
        console.log(
          data.data.isNewUser ? '✅ New user registered!' : '✅ User logged in!',
          basicProfile.username
        );

        // Now check if user has an on-chain IPFS profile
        console.log('🔍 Checking for on-chain profile...');
        const result = await refetchHash();
        const onChainHash = result?.data as string;
        
        // If they have an IPFS hash, fetch that profile data
        if (onChainHash && typeof onChainHash === 'string' && onChainHash.length > 0) {
          console.log('📥 Loading IPFS profile:', onChainHash);
          try {
            const ipfsProfile = await fetchProfile(onChainHash);
            setProfile({
              ...basicProfile,
              ipfsProfile,
              ipfsHash: onChainHash,
            });
            console.log('✅ IPFS profile loaded!');
          } catch (err) {
            console.error('⚠️ Could not load IPFS profile:', err);
            // Still set basic profile even if IPFS fails
            setProfile(basicProfile);
          }
        } else {
          console.log('ℹ️ No on-chain profile found (user hasn\'t saved profile yet)');
          setProfile(basicProfile);
        }
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
        updateProfile,
        uploadAvatar,
        refreshProfile,
        isUpdatingProfile: isUpdatingProfile || isTxPending,
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
