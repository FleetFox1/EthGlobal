"use client";

import { useState, useRef } from 'react';
import { useUser } from '@/lib/UserContext';
import { UserProfile } from '@/lib/types/profile';
import { getAvatarUrl } from '@/lib/ipfs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, Save, X } from 'lucide-react';

interface ProfileEditorProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ProfileEditor({ onSave, onCancel }: ProfileEditorProps) {
  const { profile, updateProfile, uploadAvatar, isUpdatingProfile } = useUser();
  const [formData, setFormData] = useState<UserProfile>({
    username: profile?.ipfsProfile?.username || '',
    bio: profile?.ipfsProfile?.bio || '',
    email: profile?.ipfsProfile?.email || profile?.email || '',
    avatar: profile?.ipfsProfile?.avatar || '',
    socialLinks: {
      twitter: profile?.ipfsProfile?.socialLinks?.twitter || '',
      github: profile?.ipfsProfile?.socialLinks?.github || '',
      telegram: profile?.ipfsProfile?.socialLinks?.telegram || '',
      discord: profile?.ipfsProfile?.socialLinks?.discord || '',
    },
    wallets: {
      eth: profile?.address || '',
      solana: profile?.ipfsProfile?.wallets?.solana || '',
      bitcoin: profile?.ipfsProfile?.wallets?.bitcoin || '',
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile?.ipfsProfile?.avatar ? getAvatarUrl(profile.ipfsProfile.avatar) : undefined
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to IPFS
      const avatarHash = await uploadAvatar(file);
      setFormData({ ...formData, avatar: avatarHash });
      console.log('✅ Avatar uploaded:', avatarHash);
    } catch (err: any) {
      console.error('❌ Avatar upload failed:', err);
      setError(err.message || 'Failed to upload avatar');
      setAvatarPreview(undefined);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProfile(formData);
      console.log('✅ Profile saved!');
      onSave?.();
    } catch (err: any) {
      console.error('❌ Profile save failed:', err);
      setError(err.message || 'Failed to save profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-gray-700">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-12 h-12 text-gray-600" />
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar || isUpdatingProfile}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-colors"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        <p className="text-sm text-gray-400">
          Click camera icon to upload avatar (max 5MB)
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Your username"
          disabled={isUpdatingProfile}
          className="bg-gray-900 border-gray-700"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
          disabled={isUpdatingProfile}
          className="bg-gray-900 border-gray-700"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          disabled={isUpdatingProfile}
          className="bg-gray-900 border-gray-700"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            type="text"
            value={formData.socialLinks?.twitter || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value },
              })
            }
            placeholder="@username"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="text"
            value={formData.socialLinks?.github || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, github: e.target.value },
              })
            }
            placeholder="username"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram">Telegram</Label>
          <Input
            id="telegram"
            type="text"
            value={formData.socialLinks?.telegram || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, telegram: e.target.value },
              })
            }
            placeholder="@username"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discord">Discord</Label>
          <Input
            id="discord"
            type="text"
            value={formData.socialLinks?.discord || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, discord: e.target.value },
              })
            }
            placeholder="username#1234"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>
      </div>

      {/* External Wallets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">External Wallets</h3>

        <div className="space-y-2">
          <Label htmlFor="solana">Solana Address</Label>
          <Input
            id="solana"
            type="text"
            value={formData.wallets?.solana || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                wallets: { ...formData.wallets, solana: e.target.value },
              })
            }
            placeholder="Solana wallet address"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bitcoin">Bitcoin Address</Label>
          <Input
            id="bitcoin"
            type="text"
            value={formData.wallets?.bitcoin || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                wallets: { ...formData.wallets, bitcoin: e.target.value },
              })
            }
            placeholder="Bitcoin wallet address"
            disabled={isUpdatingProfile}
            className="bg-gray-900 border-gray-700"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isUpdatingProfile || isUploadingAvatar}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isUpdatingProfile ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving to IPFS & Blockchain...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isUpdatingProfile || isUploadingAvatar}
            variant="outline"
            className="border-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {isUpdatingProfile && (
        <div className="text-sm text-gray-400 text-center">
          <p>1. Uploading to IPFS... ✅</p>
          <p>2. Waiting for wallet signature... ⏳</p>
          <p>3. Transaction pending... ⏳</p>
        </div>
      )}
    </form>
  );
}
