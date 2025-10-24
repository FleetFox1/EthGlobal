-- Voting Configuration Table
-- Stores dynamic voting rules that can be adjusted by admin

CREATE TABLE IF NOT EXISTS voting_config (
  id SERIAL PRIMARY KEY,
  voting_duration_hours DECIMAL(10, 3) NOT NULL DEFAULT 72, -- 3 days, supports fractional hours (e.g., 0.083 = 5 minutes)
  voting_enabled BOOLEAN NOT NULL DEFAULT true,              -- Toggle voting on/off
  min_votes_required INTEGER NOT NULL DEFAULT 0,             -- Minimum votes needed for approval (0 = no minimum)
  approval_threshold_percent INTEGER NOT NULL DEFAULT 0,     -- Percent of FOR votes needed (0 = simple majority)
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO voting_config (
  voting_duration_hours,
  voting_enabled,
  min_votes_required,
  approval_threshold_percent
) VALUES (
  72,    -- 3 days (72 hours)
  true,  -- Voting enabled
  0,     -- No minimum votes
  0      -- Net votes >= 0 (50% threshold)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_voting_config_updated ON voting_config(updated_at DESC);

-- Comments
COMMENT ON TABLE voting_config IS 'Dynamic voting rules for hackathon demos and production';
COMMENT ON COLUMN voting_config.voting_duration_hours IS 'Voting period in hours (72 = 3 days, 0.083 ≈ 5 minutes for demos)';
COMMENT ON COLUMN voting_config.voting_enabled IS 'Master switch to enable/disable voting system';
COMMENT ON COLUMN voting_config.min_votes_required IS 'Minimum total votes needed before approval (0 = no minimum)';
COMMENT ON COLUMN voting_config.approval_threshold_percent IS 'Percent of FOR votes required (0 = net votes >= 0)';
