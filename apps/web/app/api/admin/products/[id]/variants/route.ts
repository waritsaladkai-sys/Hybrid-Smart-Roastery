import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '../../../../../../lib/supabase';

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { weight_gram, retail_price, wholesale_price, sku } = body;

  const admin = createAdminClient();
  
  const { data, error } = await admin
    .from('product_variants')
    .insert({
      product_id: id,
      weight_gram,
      retail_price,
      wholesale_price: wholesale_price || retail_price * 0.8,
      sku
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ variant: data }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params; // Here id is the product_id? No we need the variant_id to delete. Wait, this route is /api/admin/products/[id]/variants
  // For DELETE we should use URL params like ?variantId=123
  const url = new URL(request.url);
  const variantId = url.searchParams.get('variantId');

  if (!variantId) return NextResponse.json({ error: 'variantId is required' }, { status: 400 });

  const admin = createAdminClient();
  
  const { error } = await admin.from('product_variants').delete().eq('id', variantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
