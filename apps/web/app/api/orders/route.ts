import { createServerSupabaseClient, createAdminClient } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET /api/orders — authenticated user's orders (staff sees all) */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Use admin client to bypass RLS type inference issues
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const profile = profileRaw as any;
  const isStaff = profile?.role === 'ADMIN' || profile?.role === 'STAFF';

  let query = admin
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

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderRaw, error: orderErr } = await admin
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
  const order = orderRaw as any;

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 400 });

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

  await admin.from('payments').insert({
    order_id: order.id,
    provider: 'promptpay', // Changed from gbprimepay since we use direct promptpay now
    amount: total,
    status: 'PENDING',
  });

  // Try to send emails (non-blocking)
  try {
    const { sendOrderConfirmation, sendAdminOrderAlert } = await import('../../../lib/email');
    
    // Get user email if available (guest might not have one, or maybe it's in a profile)
    // For now, if the user is logged in, we get their email from auth
    let customerEmail = null;
    if (user?.id) {
      const { data: userData } = await admin.auth.admin.getUserById(user.id);
      customerEmail = userData?.user?.email;
    }
    
    // Admin alert
    await sendAdminOrderAlert({
      orderId: order.id,
      customerName: shippingAddress.recipient_name,
      phone: shippingAddress.phone,
      total,
      province: shippingAddress.province,
    });

    // Customer confirmation
    if (customerEmail) {
      await sendOrderConfirmation({
        to: customerEmail,
        orderId: order.id,
        customerName: shippingAddress.recipient_name,
        items: items.map((i: any) => ({ name: i.product_name_th, qty: i.quantity, price: i.unit_price })),
        total,
      });
    }
  } catch (emailErr) {
    console.error('Failed to send order emails:', emailErr);
  }

  return NextResponse.json({ order }, { status: 201 });
}
