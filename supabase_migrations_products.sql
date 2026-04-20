-- ==========================================
-- EIGHT COFFEE ROASTERS: PRODUCT CMS DB UPDATES
-- Please run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Alter products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brew_guide JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;

-- 2. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for product-images

-- Allow public read (anyone can see product images)
CREATE POLICY "Public product image read" ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Allow Admin/Staff insert
CREATE POLICY "Admin product image insert" ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

-- Allow Admin/Staff update/delete
CREATE POLICY "Admin product image update" ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);

CREATE POLICY "Admin product image delete" ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);
