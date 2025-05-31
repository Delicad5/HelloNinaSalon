-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON public.users;
CREATE POLICY "Public read access"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth users can insert" ON public.users;
CREATE POLICY "Auth users can insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Enable realtime
alter publication supabase_realtime add table public.users;
