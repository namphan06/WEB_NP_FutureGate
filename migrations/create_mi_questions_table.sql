-- Create MI Questions table
CREATE TABLE IF NOT EXISTS public.mi_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    question_text TEXT NOT NULL,
    intelligence_type TEXT NOT NULL CHECK (intelligence_type IN ('IA', 'IE', 'LO', 'LI', 'SP', 'BO', 'MU', 'NA', 'EX')),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.mi_questions ENABLE ROW LEVEL SECURITY;

-- Policies for mi_questions
-- Anyone can view active questions
CREATE POLICY "Anyone can view active MI questions"
ON public.mi_questions FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins have full access to MI questions"
ON public.mi_questions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Trigger for updated_at
CREATE TRIGGER set_mi_questions_updated_at
    BEFORE UPDATE ON public.mi_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
