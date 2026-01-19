-- Migration to implement comment read tracking system
-- Creates table to track when users read comments on cards

-- Create comment_reads table to track user comment reading activity
CREATE TABLE IF NOT EXISTS public.comment_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_reads_pkey PRIMARY KEY (id),
  CONSTRAINT comment_reads_unique_user_card UNIQUE (card_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_reads_card_id ON comment_reads(card_id);
CREATE INDEX IF NOT EXISTS idx_comment_reads_user_id ON comment_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reads_last_read ON comment_reads(last_read_at DESC);

-- Enable Row Level Security
ALTER TABLE comment_reads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own comment read records"
  ON comment_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create comment read records for themselves"
  ON comment_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comment read records"
  ON comment_reads FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comment read records"
  ON comment_reads FOR DELETE
  USING (user_id = auth.uid());

-- Create function to check if a card has unread comments for a user
CREATE OR REPLACE FUNCTION has_unread_comments(card_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  last_comment_time timestamp with time zone;
  last_read_time timestamp with time zone;
BEGIN
  -- Get the timestamp of the most recent comment on the card
  SELECT MAX(created_at) INTO last_comment_time
  FROM comentarios 
  WHERE card_id = card_uuid;
  
  -- If no comments exist, return false
  IF last_comment_time IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get the last time this user read comments on this card
  SELECT last_read_at INTO last_read_time
  FROM comment_reads 
  WHERE card_id = card_uuid AND user_id = user_uuid;
  
  -- If user never read or last comment is newer than last read, return true
  IF last_read_time IS NULL OR last_comment_time > last_read_time THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark comments as read for a user
CREATE OR REPLACE FUNCTION mark_comments_as_read(card_uuid uuid, user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO comment_reads (card_id, user_id, last_read_at)
  VALUES (card_uuid, user_uuid, now())
  ON CONFLICT (card_id, user_id)
  DO UPDATE SET last_read_at = now(), updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically update read timestamp when comments are viewed
CREATE OR REPLACE FUNCTION update_comment_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When a comment is inserted, we don't automatically mark as read
  -- This should be done explicitly when user opens the card
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON comment_reads TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO comment_reads (card_id, user_id, last_read_at)
-- SELECT c.id, '11111111-1111-1111-1111-111111111111', now() - interval '1 hour'
-- FROM cards c
-- LIMIT 5
-- ON CONFLICT (card_id, user_id) DO NOTHING;
