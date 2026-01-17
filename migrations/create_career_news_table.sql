-- ===========================================
-- Career News Feature - Database Migration
-- ===========================================
-- Run this in Supabase SQL Editor if tables haven't been created yet

-- 1. Create career_news table
CREATE TABLE IF NOT EXISTS public.career_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Basic info
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text NOT NULL,
  
  -- Media
  cover_image_url text,
  
  -- Classification
  category text NOT NULL CHECK (category IN ('market_trends', 'company_news', 'industry_insights', 'career_tips', 'events')),
  tags text[] DEFAULT '{}',
  
  -- Company linking
  related_company_ids uuid[] DEFAULT '{}',
  
  -- Status & Features
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  
  -- Metadata
  author_id uuid REFERENCES auth.users(id),
  view_count integer DEFAULT 0,
  
  -- SEO
  meta_title text,
  meta_description text
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_career_news_category ON public.career_news(category);
CREATE INDEX IF NOT EXISTS idx_career_news_status ON public.career_news(status);
CREATE INDEX IF NOT EXISTS idx_career_news_created_at ON public.career_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_news_featured ON public.career_news(is_featured) WHERE is_featured = true;

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_career_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS career_news_updated_at ON public.career_news;
CREATE TRIGGER career_news_updated_at
  BEFORE UPDATE ON public.career_news
  FOR EACH ROW
  EXECUTE FUNCTION update_career_news_updated_at();

-- 4. Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_news_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS career_news_slug ON public.career_news;
CREATE TRIGGER career_news_slug
  BEFORE INSERT ON public.career_news
  FOR EACH ROW
  EXECUTE FUNCTION generate_news_slug();

-- 5. Enable RLS
ALTER TABLE public.career_news ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read published news" ON public.career_news;
DROP POLICY IF EXISTS "Admin can manage all news" ON public.career_news;

-- 7. Create RLS policies
-- Anyone can read published news
CREATE POLICY "Anyone can read published news"
  ON public.career_news
  FOR SELECT
  USING (status = 'published');

-- Admin can do everything
CREATE POLICY "Admin can manage all news"
  ON public.career_news
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- Storage Bucket Setup
-- ===========================================
-- Run these in Supabase Dashboard > Storage or via API

-- Create the bucket (if not exists)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('career-news-images', 'career-news-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for career-news-images bucket
-- (Run in Supabase Dashboard > Storage > Policies)

-- 1. Public read access
-- CREATE POLICY "Public read access"
--   ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'career-news-images');

-- 2. Admin upload access
-- CREATE POLICY "Admin upload access"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'career-news-images'
--     AND EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- 3. Admin delete access
-- CREATE POLICY "Admin delete access"
--   ON storage.objects
--   FOR DELETE
--   USING (
--     bucket_id = 'career-news-images'
--     AND EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- ===========================================
-- Helper function for view count (optional)
-- ===========================================
CREATE OR REPLACE FUNCTION increment_news_view_count(news_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.career_news
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
