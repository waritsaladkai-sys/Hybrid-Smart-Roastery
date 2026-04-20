import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '../../../../../../lib/supabase';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.role === 'ADMIN' || (data as any)?.role === 'STAFF';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const admin = createAdminClient();
    
    // Verify product exists
    const { data: product, error: productError } = await admin.from('products').select('id, slug').eq('id', id).single();
    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage inside product-images branch
    const fileName = `${product.slug}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await admin
      .storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = admin.storage.from('product-images').getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // Update products table
    await admin.from('products').update({ image_url: imageUrl }).eq('id', id);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Image upload exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
