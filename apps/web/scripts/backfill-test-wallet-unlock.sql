-- Backfill faucet unlock for test wallet
-- Run this in Neon SQL Editor to add your test wallet to faucet_unlocks table

-- Test wallet: 0x5b2102eabb473045b9644e254ee9819325b1067a
INSERT INTO faucet_unlocks (wallet_address, payment_method, unlocked_at, payment_amount)
VALUES (
  LOWER('0x5b2102eabb473045b9644e254ee9819325b1067a'),
  'ETH',
  NOW(),
  0.00033
)
ON CONFLICT (wallet_address) DO UPDATE SET
  unlocked_at = NOW();

-- Admin wallet: 0x71940fd31a77979f3a54391b86768c661c78c263 (optional)
INSERT INTO faucet_unlocks (wallet_address, payment_method, unlocked_at, payment_amount)
VALUES (
  LOWER('0x71940fd31a77979f3a54391b86768c661c78c263'),
  'ETH',
  NOW(),
  0.00033
)
ON CONFLICT (wallet_address) DO UPDATE SET
  unlocked_at = NOW();

-- Verify the records were inserted
SELECT 
  wallet_address,
  unlocked_at,
  payment_method,
  payment_amount,
  total_claims,
  last_claim_at
FROM faucet_unlocks
ORDER BY unlocked_at DESC;
