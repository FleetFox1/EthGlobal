# 🗄️ BugDex Decentralized User Data Architecture

**Goal:** Persist user profile data (avatar, email, external wallets, preferences) in a fully decentralized way while maintaining good UX.

**Timeline:** 12 days to implement  
**Status:** 🚧 Planning Phase

---

## 🎯 Requirements

### User Data to Store:
1. **Profile Info**
   - Username (auto-generated or custom)
   - Avatar image
   - Email (optional, for notifications)
   - Bio/description
   - External wallet addresses (link multiple wallets)

2. **User Activity** (Already on-chain)
   - ✅ Bug submissions → stored in BugVotingV2 contract
   - ✅ Votes → stored in BugVotingV2 contract
   - ✅ NFTs → stored in BugNFT contract
   - ✅ BUG token balance → stored in BugTokenV2 contract

3. **User Preferences**
   - Notification settings
   - Display preferences
   - Privacy settings

---

## 🏗️ Recommended Architecture: **Lighthouse + Privy**

### Why This Approach:
✅ **Fully Decentralized** - IPFS storage via Lighthouse  
✅ **Prize Alignment** - Can submit for Lighthouse $1k prize (but not as main 3)  
✅ **Encrypted Storage** - User data is private and encrypted  
✅ **Fast Implementation** - Well-documented, ~8-12 hours  
✅ **Auth Handled** - Privy manages login/sessions  
✅ **Cost Effective** - Lighthouse is free/cheap for hackathon use

---

## 📐 System Design

### Layer 1: Authentication (Already Done ✅)
**Privy** handles:
- Wallet connection (MetaMask, Coinbase, etc.)
- Email authentication
- Session management
- User ID generation

### Layer 2: Profile Storage (New - Lighthouse)
**Lighthouse IPFS** stores:
- Profile JSON metadata
- Avatar images
- Encrypted private data

### Layer 3: Profile Discovery (New - Simple Contract)
**ProfileRegistry Contract** stores:
- Mapping: `walletAddress => lighthouseIPFSHash`
- Events for profile updates
- Minimal on-chain footprint

### Layer 4: On-chain Activity (Already Done ✅)
**Existing Contracts** already track:
- Bug submissions in BugVotingV2
- NFT ownership in BugNFT
- Token balances in BugTokenV2

---

## 🔧 Implementation Plan

### Phase 1: Profile Storage Contract (2-3 hours)

Create `contracts/UserProfileRegistry.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfileRegistry {
    // Mapping from wallet address to profile IPFS hash
    mapping(address => string) public profiles;
    
    // Events
    event ProfileUpdated(address indexed user, string ipfsHash);
    
    // Update profile
    function updateProfile(string memory ipfsHash) external {
        profiles[msg.sender] = ipfsHash;
        emit ProfileUpdated(msg.sender, ipfsHash);
    }
    
    // Get profile
    function getProfile(address user) external view returns (string memory) {
        return profiles[user];
    }
}
```

**Why so simple?**
- Just stores IPFS hash pointer
- User owns their data (on IPFS)
- Minimal gas costs (~30k gas to update)
- Easy to query
- Can be indexed by Envio/Blockscout

---

### Phase 2: Lighthouse Integration (4-6 hours)

#### Install Lighthouse SDK:
```bash
cd apps/web
pnpm add @lighthouse-web3/sdk
```

#### Create `lib/lighthouse.ts`:

```typescript
import lighthouse from '@lighthouse-web3/sdk';

export interface UserProfileData {
  username: string;
  avatar?: string; // IPFS hash or data URL
  email?: string;
  bio?: string;
  externalWallets?: string[]; // Additional wallets
  preferences?: {
    notifications: boolean;
    privacy: 'public' | 'private';
  };
  social?: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Upload user profile data to Lighthouse IPFS
 */
export async function uploadProfileToLighthouse(
  profileData: UserProfileData,
  walletAddress: string
): Promise<string> {
  try {
    // Convert profile data to JSON
    const jsonData = JSON.stringify(profileData, null, 2);
    
    // Upload to Lighthouse
    const response = await lighthouse.uploadText(
      jsonData,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY!
    );
    
    return response.data.Hash; // Returns IPFS hash
  } catch (error) {
    console.error('Error uploading to Lighthouse:', error);
    throw error;
  }
}

/**
 * Upload avatar image to Lighthouse
 */
export async function uploadAvatarToLighthouse(
  file: File
): Promise<string> {
  try {
    const response = await lighthouse.upload(
      [file],
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY!
    );
    
    return response.data[0].Hash; // Returns IPFS hash
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * Fetch profile data from Lighthouse IPFS
 */
export async function fetchProfileFromLighthouse(
  ipfsHash: string
): Promise<UserProfileData | null> {
  try {
    const url = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Get avatar URL from IPFS hash
 */
export function getAvatarUrl(ipfsHash: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
}
```

---

### Phase 3: Update User Context (3-4 hours)

Modify `lib/UserContext.tsx` to include profile management:

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useReadContract, useWriteContract } from 'wagmi';
import { 
  UserProfileData, 
  uploadProfileToLighthouse, 
  fetchProfileFromLighthouse 
} from './lighthouse';
import { profileRegistryABI, profileRegistryAddress } from './contracts';

export interface UserProfile extends UserProfileData {
  address: string;
  ipfsHash?: string;
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  walletAddress: string | undefined;
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const walletAddress = user?.wallet?.address;

  // Read profile IPFS hash from contract
  const { data: ipfsHash } = useReadContract({
    address: profileRegistryAddress,
    abi: profileRegistryABI,
    functionName: 'getProfile',
    args: walletAddress ? [walletAddress] : undefined,
    enabled: !!walletAddress,
  });

  // Load profile from Lighthouse when we have IPFS hash
  useEffect(() => {
    if (!ipfsHash || typeof ipfsHash !== 'string') return;
    
    loadProfile(ipfsHash);
  }, [ipfsHash]);

  const loadProfile = async (hash: string) => {
    try {
      setLoading(true);
      const profileData = await fetchProfileFromLighthouse(hash);
      
      if (profileData && walletAddress) {
        setProfile({
          ...profileData,
          address: walletAddress,
          ipfsHash: hash,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfileData>) => {
    if (!walletAddress) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      
      // Merge with existing profile
      const updatedProfile: UserProfileData = {
        username: profile?.username || `User${walletAddress.slice(0, 6)}`,
        ...profile,
        ...data,
        updatedAt: Date.now(),
      };

      // Upload to Lighthouse
      const newIpfsHash = await uploadProfileToLighthouse(
        updatedProfile,
        walletAddress
      );

      // Update contract with new IPFS hash
      // (This will trigger useReadContract to refetch)
      // await writeContract({...})

      console.log('✅ Profile updated:', newIpfsHash);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
```

---

### Phase 4: Profile UI Components (2-3 hours)

Create `components/ProfileEditor.tsx`:

```typescript
"use client";

import { useState } from 'react';
import { useUser } from '@/lib/useUser';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export function ProfileEditor() {
  const { profile, updateProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    twitter: profile?.social?.twitter || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        social: {
          twitter: formData.twitter,
        },
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="space-y-4">
      {editing ? (
        <>
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <Textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Twitter handle"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <h3 className="font-bold">{profile?.username}</h3>
            <p className="text-sm text-muted-foreground">{profile?.bio}</p>
          </div>
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </>
      )}
    </div>
  );
}
```

---

## 🗂️ Data Flow

### When User Logs In:
```
1. Privy authenticates user → gets wallet address
2. Read ProfileRegistry contract → get IPFS hash
3. If IPFS hash exists:
   → Fetch from Lighthouse → Load profile
4. If no IPFS hash:
   → Create default profile → Show onboarding
```

### When User Updates Profile:
```
1. User edits profile in UI
2. Upload new data to Lighthouse IPFS
3. Get new IPFS hash
4. Call ProfileRegistry.updateProfile(newHash)
5. Transaction confirms → profile updated
```

### When Viewing Other Users:
```
1. Get user's wallet address (from bug submission, NFT, etc.)
2. Read ProfileRegistry.getProfile(address)
3. Fetch profile from Lighthouse using IPFS hash
4. Display profile info
```

---

## 💾 What Gets Stored Where

### Lighthouse IPFS (Decentralized):
- ✅ Avatar images
- ✅ Profile JSON (username, bio, email, etc.)
- ✅ Preferences
- ✅ Social links
- ✅ External wallets

### Smart Contract (On-chain):
- ✅ IPFS hash pointer (32 bytes)
- ✅ Update timestamp
- ✅ Minimal gas cost

### Existing Contracts (Already On-chain):
- ✅ Bug submissions
- ✅ Votes
- ✅ NFT ownership
- ✅ Token balances

### Privy (Centralized - Auth Only):
- ✅ Session management
- ✅ Email verification
- ✅ Wallet connection state

### LocalStorage (Client Cache):
- ✅ Last loaded profile (for offline viewing)
- ✅ Draft edits (auto-save)

---

## ⏱️ Implementation Timeline (12 Days Total)

### Days 1-2: Smart Contract
- [ ] Write UserProfileRegistry.sol
- [ ] Write deployment script
- [ ] Deploy to Sepolia
- [ ] Verify on Etherscan

### Days 3-4: Lighthouse Integration
- [ ] Install Lighthouse SDK
- [ ] Create lighthouse.ts utilities
- [ ] Test upload/fetch
- [ ] Handle errors gracefully

### Days 5-6: Update User Context
- [ ] Modify UserContext to include profile data
- [ ] Add updateProfile function
- [ ] Add avatar upload
- [ ] Test with wagmi hooks

### Days 7-8: Profile UI
- [ ] Create ProfileEditor component
- [ ] Create AvatarUpload component
- [ ] Update profile page
- [ ] Add "Edit Profile" button

### Days 9-10: Bug Association
- [ ] Show user profile on bug submissions
- [ ] Show user profile on NFT cards
- [ ] Link to user profiles from leaderboard
- [ ] Test all profile links

### Days 11-12: Polish & Testing
- [ ] Test complete flow
- [ ] Handle edge cases (no profile, loading states)
- [ ] Add loading skeletons
- [ ] Test on multiple wallets
- [ ] Create demo for hackathon

---

## 🎯 Prize Alignment

### Can Submit for Lighthouse Prize? 
**Maybe as 4th prize** (but you said only 3 submissions)

**If you want to swap:**
- Drop Blockscout ($10k pool)
- Add Lighthouse ($1k pool)
- **Not recommended** - Blockscout has 10x larger prize pool

**Better approach:**
- Use Lighthouse tech but DON'T submit for prize
- Mention in README: "Uses Lighthouse for decentralized storage"
- Focus on top 3: PYUSD, Avail, Blockscout

---

## 🔒 Privacy & Security

### Public Data:
- Username
- Avatar
- Bio
- Social links
- Bug submissions (on-chain)
- NFTs (on-chain)

### Private Data (Encrypted):
- Email (optional)
- External wallets (if user wants private)
- Notification preferences

### Lighthouse Encryption:
```typescript
// For private data
await lighthouse.uploadEncrypted(
  file,
  apiKey,
  publicKey,
  signedMessage
);
```

---

## 🚀 Alternative: Simpler Approach (If Short on Time)

### Ultra-Simple: IPFS + No Contract

**Skip the contract, just use:**
1. Upload profile to Lighthouse
2. Store IPFS hash in localStorage
3. Share IPFS hash via URL params
4. Not fully decentralized but faster

**Pros:**
- 2-3 hours implementation
- No contract deployment
- No gas costs

**Cons:**
- No on-chain profile discovery
- Less impressive for judges
- Profile links break if localStorage cleared

---

## 📝 Example Profile JSON Structure

```json
{
  "version": "1.0.0",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "username": "BugHunter42",
  "avatar": "QmX7Kd9...ipfsHash",
  "bio": "Environmental scientist and bug enthusiast 🐛",
  "email": "user@example.com",
  "externalWallets": [
    "0x1234...anotherWallet",
    "0x5678...yetAnother"
  ],
  "social": {
    "twitter": "@bughunter42",
    "github": "bughunter42",
    "discord": "bughunter#1234"
  },
  "preferences": {
    "notifications": true,
    "privacy": "public",
    "theme": "dark"
  },
  "stats": {
    "bugsSubmitted": 15,
    "votesGiven": 42,
    "nftsOwned": 3
  },
  "createdAt": 1697155200000,
  "updatedAt": 1697328000000
}
```

---

## ✅ Checklist

### Setup:
- [ ] Install Lighthouse SDK
- [ ] Get Lighthouse API key
- [ ] Deploy ProfileRegistry contract
- [ ] Update contracts.ts with new address

### Implementation:
- [ ] Create lighthouse.ts utilities
- [ ] Update UserContext
- [ ] Create ProfileEditor component
- [ ] Create AvatarUpload component
- [ ] Update profile page

### Integration:
- [ ] Show profiles on bug submissions
- [ ] Show profiles on NFT cards
- [ ] Show profiles on leaderboard
- [ ] Show profiles on voting page

### Testing:
- [ ] Test profile creation
- [ ] Test profile updates
- [ ] Test avatar upload
- [ ] Test multiple wallets
- [ ] Test profile loading

---

## 🎬 Demo Flow for Hackathon

**Show this in your video:**

1. **Login** → "Privy handles authentication"
2. **Create Profile** → "Upload avatar to Lighthouse IPFS"
3. **Edit Profile** → "Add bio, social links"
4. **Submit Bug** → "Profile shows on submission"
5. **View Collection** → "See your profile on NFTs"
6. **Leaderboard** → "Rankings show user profiles"

**Key Message:**
> "BugDex stores ALL user data on decentralized storage (Lighthouse IPFS), with only a small pointer stored on-chain. This means users truly own their profiles and data, while maintaining the convenience of modern web apps."

---

**Questions?** Let me know which approach you want to take!
