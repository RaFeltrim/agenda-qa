-- Migration: Complete v1 Features Integration
-- Adds missing tables and enhances existing ones for full v1 feature parity

-- 1. Create card_comments table (if not exists)
CREATE TABLE IF NOT EXISTS public.card_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE
);

-- 2. Create card_attachments table (if not exists)
CREATE TABLE IF NOT EXISTS public.card_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create sprints table (if not exists)
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- 4. Add sprint_id column to cards table (if not exists)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON public.card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_comments_author_id ON public.card_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_card_comments_created_at ON public.card_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id ON public.card_attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_uploaded_by ON public.card_attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON public.sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON public.sprints(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_cards_sprint_id ON public.cards(sprint_id);

-- 6. Enable RLS
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for card_comments
CREATE POLICY "Users can view comments on cards they can access" 
ON public.card_comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.cards c 
        WHERE c.id = card_comments.card_id 
        AND (
            c.assignee_id = auth.uid() 
            OR c.project_id IN (
                SELECT project_id FROM public.project_members 
                WHERE user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Users can create comments on cards they can access" 
ON public.card_comments FOR INSERT 
WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.cards c 
        WHERE c.id = card_comments.card_id 
        AND (
            c.assignee_id = auth.uid() 
            OR c.project_id IN (
                SELECT project_id FROM public.project_members 
                WHERE user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Users can update their own comments" 
ON public.card_comments FOR UPDATE 
USING (
    author_id = auth.uid()
);

CREATE POLICY "Users can delete their own comments" 
ON public.card_comments FOR DELETE 
USING (
    author_id = auth.uid()
);

-- 8. Create RLS policies for card_attachments
CREATE POLICY "Users can view attachments on cards they can access" 
ON public.card_attachments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.cards c 
        WHERE c.id = card_attachments.card_id 
        AND (
            c.assignee_id = auth.uid() 
            OR c.project_id IN (
                SELECT project_id FROM public.project_members 
                WHERE user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Users can upload attachments to cards they can access" 
ON public.card_attachments FOR INSERT 
WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.cards c 
        WHERE c.id = card_attachments.card_id 
        AND (
            c.assignee_id = auth.uid() 
            OR c.project_id IN (
                SELECT project_id FROM public.project_members 
                WHERE user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Users can delete their own attachments" 
ON public.card_attachments FOR DELETE 
USING (
    uploaded_by = auth.uid()
);

-- 9. Create RLS policies for sprints
CREATE POLICY "Users can view sprints for projects they belong to" 
ON public.sprints FOR SELECT 
USING (
    project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
);

CREATE POLICY "Users can create sprints for projects they belong to" 
ON public.sprints FOR INSERT 
WITH CHECK (
    created_by = auth.uid()
    AND project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'editor')
    )
);

CREATE POLICY "Users can update sprints they created or for projects they manage" 
ON public.sprints FOR UPDATE 
USING (
    created_by = auth.uid()
    OR project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
);

CREATE POLICY "Users can delete sprints they created" 
ON public.sprints FOR DELETE 
USING (
    created_by = auth.uid()
);

-- 10. Create updated_at trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Add triggers for automatic updated_at
DROP TRIGGER IF EXISTS update_card_comments_updated_at ON public.card_comments;
CREATE TRIGGER update_card_comments_updated_at 
    BEFORE UPDATE ON public.card_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
CREATE TRIGGER update_sprints_updated_at 
    BEFORE UPDATE ON public.sprints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprints TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 13. Insert sample data (optional - remove in production)
-- INSERT INTO public.sprints (name, goal, start_date, end_date, status, created_by) VALUES
-- ('Sprint 1 - Initial Setup', 'Setup project foundation and basic features', '2024-01-01', '2024-01-14', 'active', auth.uid()),
-- ('Sprint 2 - Core Features', 'Implement core Kanban functionality', '2024-01-15', '2024-01-28', 'planning', auth.uid());
