-- Conservation Donation System
-- Tracks PYUSD donations to conservation causes voted on by BUG token holders

-- Conservation Organizations Table
CREATE TABLE IF NOT EXISTS conservation_orgs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  wallet_address VARCHAR(42) NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  category VARCHAR(100), -- wildlife, ocean, forest, climate, etc.
  verified BOOLEAN DEFAULT false,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(42) -- admin wallet
);

-- Donation Tracking Table
CREATE TABLE IF NOT EXISTS conservation_donations (
  id SERIAL PRIMARY KEY,
  donor_wallet VARCHAR(42) NOT NULL,
  amount_pyusd DECIMAL(20, 6) NOT NULL, -- PYUSD amount donated
  transaction_hash VARCHAR(66) NOT NULL,
  quarter VARCHAR(10) NOT NULL, -- e.g., "2025-Q4"
  donation_wallet VARCHAR(42) NOT NULL, -- BugDex conservation wallet
  donated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  blockchain_network VARCHAR(50) DEFAULT 'sepolia'
);

-- Quarterly Voting for Conservation Orgs
CREATE TABLE IF NOT EXISTS conservation_votes (
  id SERIAL PRIMARY KEY,
  voter_wallet VARCHAR(42) NOT NULL,
  org_id INTEGER NOT NULL REFERENCES conservation_orgs(id),
  bug_balance DECIMAL(20, 6) NOT NULL, -- BUG tokens held at vote time (for weighted voting)
  quarter VARCHAR(10) NOT NULL, -- e.g., "2025-Q4"
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(voter_wallet, quarter) -- One vote per wallet per quarter
);

-- Quarterly Distribution History
CREATE TABLE IF NOT EXISTS conservation_distributions (
  id SERIAL PRIMARY KEY,
  quarter VARCHAR(10) NOT NULL,
  org_id INTEGER NOT NULL REFERENCES conservation_orgs(id),
  total_pyusd DECIMAL(20, 6) NOT NULL,
  transaction_hash VARCHAR(66),
  distributed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vote_count INTEGER NOT NULL,
  weighted_vote_total DECIMAL(20, 6) NOT NULL -- Total BUG tokens voted
);

-- Insert some example conservation organizations
INSERT INTO conservation_orgs (name, description, wallet_address, category, verified) VALUES
  (
    'Ocean Conservancy',
    'Protecting ocean wildlife and ecosystems through science-based solutions',
    '0x0000000000000000000000000000000000000001',
    'ocean',
    true
  ),
  (
    'World Wildlife Fund',
    'Conservation of nature and reduction of the most pressing threats to wildlife',
    '0x0000000000000000000000000000000000000002',
    'wildlife',
    true
  ),
  (
    'Rainforest Alliance',
    'Working to conserve biodiversity and ensure sustainable livelihoods',
    '0x0000000000000000000000000000000000000003',
    'forest',
    true
  ),
  (
    'The Nature Conservancy',
    'Protecting lands and waters on which all life depends',
    '0x0000000000000000000000000000000000000004',
    'climate',
    true
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_quarter ON conservation_donations(quarter);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON conservation_donations(donor_wallet);
CREATE INDEX IF NOT EXISTS idx_votes_quarter ON conservation_votes(quarter);
CREATE INDEX IF NOT EXISTS idx_votes_org ON conservation_votes(org_id);
CREATE INDEX IF NOT EXISTS idx_distributions_quarter ON conservation_distributions(quarter);

-- Comments
COMMENT ON TABLE conservation_orgs IS 'Verified conservation organizations eligible for quarterly donations';
COMMENT ON TABLE conservation_donations IS 'PYUSD donations made by community to conservation wallet';
COMMENT ON TABLE conservation_votes IS 'BUG token holder votes for which org receives quarterly donations';
COMMENT ON TABLE conservation_distributions IS 'History of quarterly distributions to conservation orgs';
COMMENT ON COLUMN conservation_votes.bug_balance IS 'BUG token balance at vote time for weighted voting';
COMMENT ON COLUMN conservation_distributions.weighted_vote_total IS 'Total BUG tokens voted (for calculating winner)';
