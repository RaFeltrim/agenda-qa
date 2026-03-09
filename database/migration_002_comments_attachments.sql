-- =====================================================
-- Migration 002: Create missing tables for Comments and Attachments
-- Target: Supabase SQL Editor
-- Date: 2026-02-27
-- 
-- This migration creates the tables required by the Modal
-- tabs "Comments" and "Attachments" which were returning 404/400.
-- =====================================================

BEGIN;

-- =============================================================
-- 1. Create card_comments table
-- =============================================================
CREATE TABLE IF NOT EXISTS public.card_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_edited BOOLEAN NOT NULL DEFAULT false
);

-- Index for faster filtering by card
CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON public.card_comments(card_id);

-- Enable RLS
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Comments
DROP POLICY IF EXISTS card_comments_select ON public.card_comments;
CREATE POLICY card_comments_select ON public.card_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS card_comments_insert ON public.card_comments;
CREATE POLICY card_comments_insert ON public.card_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS card_comments_update ON public.card_comments;
CREATE POLICY card_comments_update ON public.card_comments FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS card_comments_delete ON public.card_comments;
CREATE POLICY card_comments_delete ON public.card_comments FOR DELETE USING (auth.uid() = author_id);


-- =============================================================
-- 2. Create card_attachments table
-- =============================================================
CREATE TABLE IF NOT EXISTS public.card_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster filtering by card
CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id ON public.card_attachments(card_id);

-- Enable RLS
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Attachments
DROP POLICY IF EXISTS card_attachments_select ON public.card_attachments;
CREATE POLICY card_attachments_select ON public.card_attachments FOR SELECT USING (true);

DROP POLICY IF EXISTS card_attachments_insert ON public.card_attachments;
CREATE POLICY card_attachments_insert ON public.card_attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS card_attachments_delete ON public.card_attachments;
CREATE POLICY card_attachments_delete ON public.card_attachments FOR DELETE USING (auth.uid() = uploaded_by);

-- =============================================================
-- 3. Storage Bucket for Attachments
-- =============================================================
-- Ensure the storage bucket exists (if you have permissions to run this via SQL, otherwise do it via Supabase Dashboard UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT DO NOTHING;


-- =============================================================
-- 4. Reload PostgREST schema cache
-- =============================================================
NOTIFY pgrst, 'reload schema';

COMMIT;
