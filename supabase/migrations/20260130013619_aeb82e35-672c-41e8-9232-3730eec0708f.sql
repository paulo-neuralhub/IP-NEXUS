-- Add nice_classes_detail to matters_v2 for storing product selections
ALTER TABLE matters_v2 
ADD COLUMN IF NOT EXISTS nice_classes_detail JSONB DEFAULT '[]';