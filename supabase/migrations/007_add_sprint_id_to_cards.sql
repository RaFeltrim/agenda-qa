-- Migration to add missing sprint_id column to cards table
-- Fixes error: column cards.sprint_id does not exist

-- Add sprint_id column to cards table
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON cards(sprint_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON cards TO authenticated;