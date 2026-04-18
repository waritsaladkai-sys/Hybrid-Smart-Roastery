import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET /api/products — public product list with optional filters */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Filters
  const roast = searchParams.get('roast');
  const origin = searchParams.get('origin');
  const process = searchParams.get('process');
  if (roast)    query = query.eq('roast_level', roast);
  if (origin)   query = query.ilike('origin', `%${origin}%`);
  if (process)  query = query.eq('process', process);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

/** POST /api/products — create product (ADMIN only, handled by middleware) */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  const { data, error } = await supabase.from('products').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data }, { status: 201 });
}
