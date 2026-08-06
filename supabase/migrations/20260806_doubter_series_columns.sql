-- Add doubter series tracking columns
-- Doubter series targets users with 2+ unlocks, 14+ days, 0 replies

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS doubter_series_position INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS doubter_series_started_at TIMESTAMPTZ;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_creators_doubter_position ON creators(doubter_series_position);
