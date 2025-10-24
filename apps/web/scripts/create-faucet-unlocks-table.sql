-- Faucet Unlock Tracking Table
-- Tracks which wallets have unlocked the faucet
-- Serves as backup to on-chain state for mobile compatibility

CREATE TABLE IF NOT EXISTS faucet_unlocks (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR(10) CHECK (payment_method IN ('ETH', 'PYUSD')),
  payment_amount DECIMAL(20, 6),
  transaction_hash VARCHAR(66),
  last_claim_at TIMESTAMP,
  total_claims INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_faucet_unlocks_wallet ON faucet_unlocks(wallet_address);

-- Index for claim tracking
CREATE INDEX IF NOT EXISTS idx_faucet_unlocks_last_claim ON faucet_unlocks(last_claim_at);

COMMENT ON TABLE faucet_unlocks IS 'Tracks faucet unlock status for each wallet address';
COMMENT ON COLUMN faucet_unlocks.wallet_address IS 'Ethereum wallet address (lowercase)';
COMMENT ON COLUMN faucet_unlocks.payment_method IS 'ETH or PYUSD';
COMMENT ON COLUMN faucet_unlocks.last_claim_at IS 'Last time user claimed from faucet (for 24h limit)';
