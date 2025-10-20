"use client";

import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types/profile';
import { getAvatarUrl, fetchProfile as fetchProfileFromIPFS } from '@/lib/ipfs';
import { useReadContract } from 'wagmi';
import { profileRegistryAddress } from '@/lib/contracts';
import { Camera, Mail, Twitter, Github, Send, MessageCircle, Wallet } from 'lucide-react';

interface ProfileCardProps {
  address: string;
  showFullProfile?: boolean;
}

export default function ProfileCard({ address, showFullProfile = false }: ProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Read IPFS hash from contract
  const { data: ipfsHash } = useReadContract({
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
    args: [address as `0x${string}`],
  });

  useEffect(() => {
    if (ipfsHash && typeof ipfsHash === 'string' && ipfsHash.length > 0) {
      fetchProfile(ipfsHash);
    } else {
      setLoading(false);
    }
  }, [ipfsHash]);

  const fetchProfile = async (hash: string) => {
    try {
      const profileData = await fetchProfileFromIPFS(hash);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-32" />
            <div className="h-3 bg-gray-800 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <p className="text-gray-400">No profile set</p>
            <p className="text-xs text-gray-600 font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.avatar ? getAvatarUrl(profile.avatar) : undefined;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-700">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.username || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-gray-600" />
          )}
        </div>

        {/* Name and Address */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">
            {profile.username || 'Anonymous User'}
          </h3>
          <p className="text-sm text-gray-400 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="mt-4 text-gray-300 text-sm">
          {profile.bio}
        </p>
      )}

      {showFullProfile && (
        <>
          {/* Email */}
          {profile.email && (
            <div className="mt-4 flex items-center space-x-2 text-gray-400">
              <Mail className="w-4 h-4" />
              <a
                href={`mailto:${profile.email}`}
                className="text-sm hover:text-blue-400 transition-colors"
              >
                {profile.email}
              </a>
            </div>
          )}

          {/* Social Links */}
          {(profile.socialLinks?.twitter ||
            profile.socialLinks?.github ||
            profile.socialLinks?.telegram ||
            profile.socialLinks?.discord) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>{profile.socialLinks.twitter}</span>
                </a>
              )}

              {profile.socialLinks.github && (
                <a
                  href={`https://github.com/${profile.socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 text-sm transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>{profile.socialLinks.github}</span>
                </a>
              )}

              {profile.socialLinks.telegram && (
                <a
                  href={`https://t.me/${profile.socialLinks.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{profile.socialLinks.telegram}</span>
                </a>
              )}

              {profile.socialLinks.discord && (
                <div className="flex items-center space-x-1 text-indigo-400 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{profile.socialLinks.discord}</span>
                </div>
              )}
            </div>
          )}

          {/* External Wallets */}
          {(profile.wallets?.solana || profile.wallets?.bitcoin) && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-400 flex items-center space-x-1">
                <Wallet className="w-4 h-4" />
                <span>External Wallets</span>
              </h4>

              {profile.wallets.solana && (
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Solana:</span>{' '}
                  <span className="font-mono">
                    {profile.wallets.solana.slice(0, 8)}...{profile.wallets.solana.slice(-6)}
                  </span>
                </div>
              )}

              {profile.wallets.bitcoin && (
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Bitcoin:</span>{' '}
                  <span className="font-mono">
                    {profile.wallets.bitcoin.slice(0, 8)}...{profile.wallets.bitcoin.slice(-6)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          {profile.metadata?.updatedAt && (
            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
              Last updated: {new Date(profile.metadata.updatedAt).toLocaleDateString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
