# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login
3. Create a new project
4. Choose a name for your project (e.g., "cobit-governance-tool")
5. Set a database password
6. Choose a region close to you
7. Wait for the project to be created

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Create Environment File

Create a `.env` file in the root directory with:

```
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own projects
CREATE POLICY "Users can only access their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);
```

## Step 5: Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Email confirmations" if you want email verification
3. Or disable it for easier testing

## Step 6: Test the Application

1. Run `npm start` to start the development server
2. Go to `http://localhost:3000`
3. You should be redirected to the login page
4. Create an account and test the functionality

## Troubleshooting

- If you get CORS errors, make sure your Supabase URL is correct
- If authentication fails, check that your anon key is correct
- If database operations fail, make sure the tables are created and RLS policies are set up 