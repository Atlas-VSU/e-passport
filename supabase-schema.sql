-- VSU E-Passport Supabase Postgres Schema and RLS Migration Script
-- Run this script in the SQL Editor of your Supabase project.

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  email TEXT,
  student_id TEXT,
  avatar_url TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If upgrading from an older schema, run these ALTER statements to add new columns:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Enable Row Level Security for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can select their own profile row"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile row"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile row (used by client-side signup)
CREATE POLICY "Users can insert their own profile row"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Create Stamps Table
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  landmark_id TEXT NOT NULL,
  photo_url TEXT,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, landmark_id)
);

-- Enable Row Level Security for Stamps
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;

-- Stamps RLS Policies
CREATE POLICY "Users can select their own stamps"
  ON public.stamps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stamps"
  ON public.stamps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stamps"
  ON public.stamps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Trigger for Auto-Creating Profiles on auth.users signup
--    This triggers on Supabase Auth user creation and pre-fills the profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, name, email, student_id, avatar_url, consent_given)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'VSU Student'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'student_id', ''),
    NULL,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Storage Setup
-- Note: Create a bucket named "stamps" manually in the Supabase Storage dashboard, 
-- or enable it with the policies below.

-- Storage Policies for bucket "stamps"
-- Users can only upload and read files inside their own {user_id}/ folder path.
CREATE POLICY "Allow users to upload stamps to their own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'stamps' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow users to update stamps in their own folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'stamps' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow public read access to stamps bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'stamps');
