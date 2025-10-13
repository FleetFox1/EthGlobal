"use client";

import { useState, useEffect } from "react";
import { useUser } from "./useUser";
import { ethers } from "ethers";

/**
 * Hook to check if the current user is an admin (contract owner)
 * Admin address is stored in environment variable
 */
export function useAdmin() {
  const { walletAddress, isAuthenticated } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState<{
    bugToken: boolean;
    bugNFT: boolean;
    bugVoting: boolean;
  }>({
    bugToken: false,
    bugNFT: false,
    bugVoting: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!walletAddress || !isAuthenticated) {
        setIsAdmin(false);
        setIsOwner({
          bugToken: false,
          bugNFT: false,
          bugVoting: false,
        });
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking admin status for:', walletAddress);
        
        // Check if wallet is in admin list (from env)
        const adminAddresses = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(',').map(addr => addr.trim().toLowerCase()) || [];
        const isInAdminList = adminAddresses.includes(walletAddress.toLowerCase());
        
        console.log('📋 Admin addresses:', adminAddresses);
        console.log('✅ Is in admin list:', isInAdminList);

        // If in admin list, set admin immediately (skip on-chain check for speed)
        if (isInAdminList) {
          setIsAdmin(true);
          setLoading(false);
          console.log('⚡ Admin verified from env list');
        }

        // Also check on-chain ownership (for verification)
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
          const bugNFTAddress = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS!;
          const bugVotingAddress = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS!;

          const ownerABI = ["function owner() view returns (address)"];

          const bugToken = new ethers.Contract(bugTokenAddress, ownerABI, provider);
          const bugNFT = new ethers.Contract(bugNFTAddress, ownerABI, provider);
          const bugVoting = new ethers.Contract(bugVotingAddress, ownerABI, provider);

          const [tokenOwner, nftOwner, votingOwner] = await Promise.all([
            bugToken.owner(),
            bugNFT.owner(),
            bugVoting.owner(),
          ]);

          const ownerStatus = {
            bugToken: tokenOwner.toLowerCase() === walletAddress.toLowerCase(),
            bugNFT: nftOwner.toLowerCase() === walletAddress.toLowerCase(),
            bugVoting: votingOwner.toLowerCase() === walletAddress.toLowerCase(),
          };

          setIsOwner(ownerStatus);
          console.log('🔐 On-chain ownership:', ownerStatus);

          // User is admin if they're in the admin list OR they own all contracts
          const isContractOwner = ownerStatus.bugToken && ownerStatus.bugNFT && ownerStatus.bugVoting;
          setIsAdmin(isInAdminList || isContractOwner);
        } else {
          // Fallback to env check only
          setIsAdmin(isInAdminList);
        }
      } catch (error) {
        console.error("❌ Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [walletAddress, isAuthenticated]);

  return {
    isAdmin,
    isOwner,
    loading,
    walletAddress,
    isAuthenticated,
  };
}
