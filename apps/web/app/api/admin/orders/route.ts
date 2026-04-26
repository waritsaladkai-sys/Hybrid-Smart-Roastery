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

/** GET /api/admin/orders — all orders (admin only) */
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = admin
    .from('orders')
    .select('*, order_items(product_name_th, weight_gram, unit_price, quantity, subtotal)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

/** PATCH /api/admin/orders?orderId=xxx — update order status */
export async function PATCH(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('orders')
    .update(body)
    .eq('id', orderId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
