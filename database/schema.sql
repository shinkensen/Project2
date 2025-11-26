-- Supabase Database Schema for Smart Fridge Manager

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fridge items table
CREATE TABLE fridge_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity DECIMAL,
  unit TEXT,
  purchase_date DATE,
  expiration_date DATE,
  image_url TEXT,
  storage_location TEXT,
  notes TEXT,
  is_consumed BOOLEAN DEFAULT false,
  consumed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detected ingredients from CV (before user confirmation)
CREATE TABLE detected_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  detected_items JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT false
);

-- Recipe suggestions table
CREATE TABLE recipe_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_data JSONB NOT NULL,
  ingredients_matched JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification log
CREATE TABLE notification_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  fridge_item_id UUID REFERENCES fridge_items(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

-- Create indexes for better performance
CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);
CREATE INDEX idx_fridge_items_expiration ON fridge_items(expiration_date);
CREATE INDEX idx_fridge_items_consumed ON fridge_items(is_consumed);
CREATE INDEX idx_detected_ingredients_user_id ON detected_ingredients(user_id);
CREATE INDEX idx_recipe_suggestions_user_id ON recipe_suggestions(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fridge items policies
CREATE POLICY "Users can view own fridge items" ON fridge_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fridge items" ON fridge_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fridge items" ON fridge_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fridge items" ON fridge_items
  FOR DELETE USING (auth.uid() = user_id);

-- Detected ingredients policies
CREATE POLICY "Users can view own detected ingredients" ON detected_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detected ingredients" ON detected_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own detected ingredients" ON detected_ingredients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own detected ingredients" ON detected_ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- Recipe suggestions policies
CREATE POLICY "Users can view own recipe suggestions" ON recipe_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe suggestions" ON recipe_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe suggestions" ON recipe_suggestions
  FOR DELETE USING (auth.uid() = user_id);

-- Notification log policies
CREATE POLICY "Users can view own notifications" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- Storage bucket setup (run this in Supabase dashboard)
-- Create a bucket called 'fridge-images'
-- Bucket policies:
-- Allow authenticated users to upload to their own folder
-- Allow authenticated users to read their own images

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fridge_items_updated_at BEFORE UPDATE ON fridge_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
