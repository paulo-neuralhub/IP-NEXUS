-- L101: AI Timeline Analysis - Add columns for rich AI analysis on communications
ALTER TABLE communications 
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_sentiment NUMERIC(3,2) CHECK (ai_sentiment >= 0 AND ai_sentiment <= 1),
  ADD COLUMN IF NOT EXISTS ai_sentiment_label TEXT CHECK (ai_sentiment_label IN ('negative', 'neutral', 'positive')),
  ADD COLUMN IF NOT EXISTS ai_topics TEXT[],
  ADD COLUMN IF NOT EXISTS ai_action_items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_urgency_score NUMERIC(3,2) CHECK (ai_urgency_score >= 0 AND ai_urgency_score <= 1),
  ADD COLUMN IF NOT EXISTS ai_entities JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_commitments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_key_dates DATE[];

-- Index for quick lookup of unanalyzed communications
CREATE INDEX IF NOT EXISTS idx_communications_ai_pending 
  ON communications(organization_id, created_at DESC) 
  WHERE ai_summary IS NULL;

COMMENT ON COLUMN communications.ai_summary IS 'AI-generated summary of the communication (2-3 sentences)';
COMMENT ON COLUMN communications.ai_sentiment IS 'Sentiment score 0 (negative) to 1 (positive)';
COMMENT ON COLUMN communications.ai_action_items IS 'Array of detected action items with text, assignee_hint, due_hint';
COMMENT ON COLUMN communications.ai_urgency_score IS 'Urgency score 0-1 based on language analysis';
COMMENT ON COLUMN communications.ai_entities IS 'Detected entities: people, companies, amounts';
COMMENT ON COLUMN communications.ai_commitments IS 'Commitments: who/what/when';