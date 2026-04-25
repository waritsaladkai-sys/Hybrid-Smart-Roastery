-- ==========================================
-- EIGHT COFFEE ROASTERS: MISSING FEATURES DB
-- Please run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create b2b_inquiries table
CREATE TABLE IF NOT EXISTS b2b_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text,
  line_id text,
  monthly_kg text,
  products text[],
  note text,
  status text DEFAULT 'NEW' -- NEW | CONTACTED | CONVERTED
);

-- Enable RLS
ALTER TABLE b2b_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow insert by anyone (public or authenticated)
CREATE POLICY "Enable insert for all users" ON b2b_inquiries FOR INSERT WITH CHECK (true);

-- Allow reading/updating only by ADMIN/STAFF
CREATE POLICY "admin_full_b2b" ON b2b_inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);


-- 2. Add slip_url to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS slip_url text;


-- 3. Storage bucket for payment slips
-- NOTE: If this fails, you can create the bucket manually via the Supabase Storage Dashboard
-- Bucket Name: payment-slips
-- Public: YES
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-slips
-- Allow public insert (since guests might upload slips during checkout)
CREATE POLICY "Public slip upload" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'payment-slips' );

-- Allow public read (so admin can view them easily)
CREATE POLICY "Public slip read" ON storage.objects FOR SELECT 
USING ( bucket_id = 'payment-slips' );

-- Allow admin delete
CREATE POLICY "Admin slip delete" ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'payment-slips' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN','STAFF'))
);
