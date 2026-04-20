import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '../../../../lib/supabase';

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

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, product_variants(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { nameTh, nameEn, slug, origin, process, roastLevel, flavorScores, descTh, tagsTh, variants, badge, inStock } = body;

  const admin = createAdminClient();

  // 1. Insert product
  const { data: product, error: productErr } = await admin.from('products').insert({
    slug,
    name_th: nameTh,
    name_en: nameEn || '',
    origin: origin || '',
    process: process || 'Washed',
    roast_level: roastLevel || 'Medium',
    flavor_sweet: flavorScores?.sweet || 3.0,
    flavor_sour: flavorScores?.sour || 3.0,
    flavor_body: flavorScores?.body || 3.0,
    flavor_aroma: flavorScores?.aroma || 3.0,
    flavor_bitter: flavorScores?.bitter || 3.0,
    desc_th: descTh,
    flavor_notes: tagsTh || [],
    badge: badge || null,
    in_stock: inStock !== undefined ? inStock : true,
    is_active: true
  }).select().single();

  if (productErr) return NextResponse.json({ error: productErr.message }, { status: 400 });

  // 2. Insert variants if provided
  if (variants && variants.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantData = variants.map((v: any) => ({
      product_id: product.id,
      weight_gram: v.weightGram,
      retail_price: v.retailPrice,
      wholesale_price: v.wholesalePrice || (v.retailPrice * 0.8) // simple default if not provided
    }));
    await admin.from('product_variants').insert(variantData);
  }

  return NextResponse.json({ product }, { status: 201 });
}
