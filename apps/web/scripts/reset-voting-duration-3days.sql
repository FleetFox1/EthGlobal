-- Reset voting duration to 3 days (72 hours) after testing

UPDATE voting_config
SET voting_duration_hours = 72,
    updated_at = NOW()
WHERE id = (SELECT id FROM voting_config ORDER BY updated_at DESC LIMIT 1);

-- Verify the change
SELECT 
    voting_duration_hours,
    (voting_duration_hours * 24) as voting_duration_days,
    voting_enabled,
    updated_at
FROM voting_config
ORDER BY updated_at DESC
LIMIT 1;
