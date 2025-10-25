-- Set voting duration to 10 minutes for testing
-- (0.167 hours = 10 minutes)

-- Update existing config
UPDATE voting_config
SET voting_duration_hours = 0.167,
    updated_at = NOW()
WHERE id = (SELECT id FROM voting_config ORDER BY updated_at DESC LIMIT 1);

-- If no config exists, insert one
INSERT INTO voting_config (voting_duration_hours, voting_enabled, created_at, updated_at)
SELECT 0.167, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM voting_config);

-- Verify the change
SELECT 
    voting_duration_hours,
    (voting_duration_hours * 60) as voting_duration_minutes,
    voting_enabled,
    updated_at
FROM voting_config
ORDER BY updated_at DESC
LIMIT 1;
