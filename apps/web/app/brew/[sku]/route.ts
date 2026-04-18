import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sku: string }> },
) {
  const { sku } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', sku)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sku: string }> },
) {
  const { sku } = await context.params;
  const body = await req.json();

  // Taste rating stub — Phase 2: save to Supabase reviews table
  console.log(`[Brew Review] SKU: ${sku}`, body);

  return NextResponse.json({
    received: true,
    sku,
    message: 'Thank you for your review!',
  });
}
