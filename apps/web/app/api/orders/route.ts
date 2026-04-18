import { createServerSupabaseClient, createAdminClient } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET /api/orders — authenticated user's orders (staff sees all) */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isStaff = profile?.role === 'ADMIN' || profile?.role === 'STAFF';

  let query = supabase
    .from('orders')
    .select('*, order_items(*, product_variants(weight_gram))')
    .order('created_at', { ascending: false });

  if (!isStaff) query = query.eq('user_id', user.id);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

/** POST /api/orders — create new order */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const { shippingAddress, items, note } = body;

  // Calculate totals
  const subtotal: number = items.reduce(
    (sum: number, item: { unit_price: number; quantity: number }) =>
      sum + item.unit_price * item.quantity, 0
  );
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  // Use admin client to bypass RLS for order creation
  const admin = createAdminClient();

  // Create order
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      ...shippingAddress,
      subtotal,
      shipping_fee: shippingFee,
      total,
      note: note ?? null,
    })
    .select()
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 400 });

  // Create order items
  const orderItems = items.map((item: {
    product_id: string;
    variant_id: string;
    product_name_th: string;
    weight_gram: number;
    unit_price: number;
    quantity: number;
  }) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name_th: item.product_name_th,
    weight_gram: item.weight_gram,
    unit_price: item.unit_price,
    quantity: item.quantity,
    subtotal: item.unit_price * item.quantity,
  }));

  const { error: itemsErr } = await admin.from('order_items').insert(orderItems);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

  // Create payment record
  await admin.from('payments').insert({
    order_id: order.id,
    provider: 'gbprimepay',
    amount: total,
    status: 'PENDING',
  });

  return NextResponse.json({ order }, { status: 201 });
}
