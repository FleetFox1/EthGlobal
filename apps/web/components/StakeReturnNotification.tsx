'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/lib/useWallet';
import { X, TrendingUp } from 'lucide-react';

interface CompletedStake {
  uploadId: string;
  bugName: string;
  stakeAmount: number;
  reward: number;
  votesFor: number;
  status: 'approved' | 'rejected';
}

export function StakeReturnNotification() {
  const { address, isConnected } = useWallet();
  const [completedStakes, setCompletedStakes] = useState<CompletedStake[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !address) {
      setCompletedStakes([]); // Clear stakes when disconnected
      return;
    }

    let isMounted = true; // Prevent state updates after unmount

    const checkCompletedStakes = async () => {
      try {
        // Skip if component unmounted
        if (!isMounted) return;
        const response = await fetch(`/api/uploads?address=${address}`);
        const data = await response.json();

        if (!data.success || !data.data) return;

        // API returns { data: { uploads: [], count: N } }
        const uploads = Array.isArray(data.data.uploads) ? data.data.uploads : [];
        
        const completed: CompletedStake[] = [];

        for (const upload of uploads) {
          // Check if voting ended and user hasn't been notified
          if (
            upload.votingStatus === 'approved' || 
            upload.votingStatus === 'rejected'
          ) {
            const bugName = upload.bugInfo?.commonName || 'Bug';
            const votesFor = upload.votesFor || 0;
            const stakeAmount = 10; // Always 10 BUG staked
            
            // Calculate reward: stake + (5 BUG per upvote)
            const reward = upload.votingStatus === 'approved' 
              ? stakeAmount + (votesFor * 5)
              : stakeAmount; // Just return stake if rejected

            completed.push({
              uploadId: upload.id,
              bugName,
              stakeAmount,
              reward,
              votesFor,
              status: upload.votingStatus,
            });
          }
        }

        if (isMounted) {
          setCompletedStakes(completed);
        }
      } catch (error) {
        console.error('Error checking completed stakes:', error);
      }
    };

    // Check on mount
    checkCompletedStakes();

    // Check every 30 seconds (only if still mounted)
    const intervalId = setInterval(() => {
      if (isMounted) {
        checkCompletedStakes();
      }
    }, 30000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [address, isConnected]);

  const visibleStakes = completedStakes.filter(
    stake => !dismissed.has(stake.uploadId)
  );

  if (visibleStakes.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {visibleStakes.map((stake) => (
        <div
          key={stake.uploadId}
          className={`
            ${stake.status === 'approved' 
              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400'
            }
            border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                <p className="font-semibold text-sm">
                  {stake.status === 'approved' ? '🎉 Voting Complete!' : '⚠️ Voting Ended'}
                </p>
              </div>
              
              <p className="text-sm font-medium">
                {stake.bugName}
              </p>

              {stake.status === 'approved' ? (
                <div className="text-xs space-y-1">
                  <p>✅ Approved with {stake.votesFor} upvote{stake.votesFor !== 1 ? 's' : ''}!</p>
                  <p className="font-bold text-base">
                    💰 {stake.reward} BUG returned
                  </p>
                  <p className="opacity-75">
                    ({stake.stakeAmount} stake + {stake.reward - stake.stakeAmount} reward)
                  </p>
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p>❌ Not approved - returning stake</p>
                  <p className="font-bold text-base">
                    💰 {stake.stakeAmount} BUG returned
                  </p>
                </div>
              )}

              {stake.status === 'approved' && (
                <p className="text-xs font-medium mt-2 pt-2 border-t border-current/20">
                  🎨 Ready to mint as NFT!
                </p>
              )}
            </div>

            <button
              onClick={() => setDismissed(prev => new Set(prev).add(stake.uploadId))}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
