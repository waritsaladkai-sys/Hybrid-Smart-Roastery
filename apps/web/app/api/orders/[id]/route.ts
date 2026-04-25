import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

/** GET /api/orders/[id] — get single order */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ order: data });
}

/** PATCH /api/orders/[id] — update status or tracking_number (admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify admin
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileRaw } = await admin.from('profiles').select('role').eq('id', user.id).single();
    const profile = profileRaw as any;
    if (profile?.role !== 'ADMIN' && profile?.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = await request.json();
  const { status, tracking_number, confirmed_payment } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;

  const { data, error } = await admin
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // If confirming payment, update payments table too
  if (confirmed_payment) {
    await admin
      .from('payments')
      .update({ status: 'PAID', paid_at: new Date().toISOString() })
      .eq('order_id', id);
  }

  return NextResponse.json({ order: data });
}
