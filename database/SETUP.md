# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

## 2. Set up Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL script

## 3. Set up Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `fridge-images`
3. Set it as **Private**
4. Add the following policies:

### Upload Policy
```sql
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fridge-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Read Policy
```sql
CREATE POLICY "Users can read own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fridge-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Delete Policy
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fridge-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4. Configure Authentication
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired
4. Optional: Enable other providers (Google, GitHub, etc.)

## 5. Get API Keys
1. Go to Settings > API
2. Copy your:
   - Project URL (`SUPABASE_URL`)
   - anon/public key (`SUPABASE_ANON_KEY`)
   - service_role key (`SUPABASE_SERVICE_ROLE_KEY`)
3. Add these to your `.env` file

## 6. Configure Edge Functions (Optional)
For automated email notifications, you can set up Edge Functions:
1. Install Supabase CLI
2. Create edge function for scheduled notifications
3. Deploy to Supabase

Alternatively, use the built-in Node cron job approach in this project.
