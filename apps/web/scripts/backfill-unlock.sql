-- Backfill Existing Faucet Unlock
-- Run this to add your wallet that already unlocked on desktop

-- Replace YOUR_WALLET_ADDRESS with your actual wallet address (the one showing unlocked on desktop)
-- Make sure to use the EXACT address (case doesn't matter, we convert to lowercase)

INSERT INTO faucet_unlocks (
  wallet_address,
  payment_method,
  unlocked_at,
  payment_amount,
  transaction_hash
) VALUES (
  LOWER('YOUR_WALLET_ADDRESS'),  -- <-- REPLACE THIS
  'ETH',                          -- Change to 'PYUSD' if you paid with PYUSD
  NOW(),
  0.00033,                        -- ETH amount (or 1.0 for PYUSD)
  '0x0000000000000000000000000000000000000000000000000000000000000000'  -- Placeholder tx hash
)
ON CONFLICT (wallet_address) 
DO UPDATE SET unlocked_at = NOW();

-- Verify it was added
SELECT * FROM faucet_unlocks;
