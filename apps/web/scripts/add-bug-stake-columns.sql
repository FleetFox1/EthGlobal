-- Add BUG token staking columns to uploads table
-- Run this migration in Neon SQL Editor

-- Add columns for BUG staking system
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS bug_staked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bug_rewards_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rewards_claimed BOOLEAN DEFAULT false;

-- Create index for querying staked submissions
CREATE INDEX IF NOT EXISTS idx_uploads_bug_staked ON uploads(bug_staked) WHERE bug_staked > 0;

-- Verify the columns were added
SELECT 
  id,
  wallet_address,
  voting_status,
  bug_staked,
  bug_rewards_earned,
  rewards_claimed,
  votes_for,
  votes_against
FROM uploads
LIMIT 5;
