"use client";

import { useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { usePrivy } from '@privy-io/react-auth';
import ProfileEditor from '@/components/ProfileEditor';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, isAuthenticated, walletAddress } = useUser();
  const { login } = usePrivy();
  const [isEditing, setIsEditing] = useState(false);

  // Not authenticated
  if (!isAuthenticated || !walletAddress) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <User className="w-16 h-16 text-gray-600 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view and edit your profile
            </p>
            <Button onClick={login} className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {isEditing ? (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
            <ProfileEditor
              onSave={() => {
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ProfileCard address={walletAddress} showFullProfile={true} />

            {/* Tips */}
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                💡 Decentralized Profile
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Your profile is stored on IPFS (permanent, decentralized)</li>
                <li>• Only the IPFS hash is stored on-chain</li>
                <li>• Your profile is portable across apps</li>
                <li>• Updates require a blockchain transaction (~$0.50)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
