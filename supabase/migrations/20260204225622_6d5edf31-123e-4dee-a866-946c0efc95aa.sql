-- Fix the attention bucket: make it public and add RLS policies
UPDATE storage.buckets SET public = true WHERE id = 'attention';

-- Add RLS policies for the attention bucket
CREATE POLICY "Attention media publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'attention');

CREATE POLICY "Users can upload to attention bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attention' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own attention media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'attention' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own attention media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'attention' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);