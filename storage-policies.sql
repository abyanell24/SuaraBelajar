-- Delete existing storage policies for avatars
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner updates" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Public read avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Auth upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
);

CREATE POLICY "Auth update avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Auth delete avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
);