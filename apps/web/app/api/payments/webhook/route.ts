// @ts-nocheck
import { createAdminClient } from '../../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/webhook
 * Receives GB Prime Pay payment callback
 * Configure in GBPrimePay dashboard: https://your-domain.vercel.app/api/payments/webhook
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // ── Dev/Mock mode: simulate payment success ────────────────
  if (process.env.PAYMENT_PROVIDER === 'mock' || process.env.GBPAY_TOKEN === 'mock') {
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const admin = createAdminClient();
    await admin.from('orders').update({ status: 'PAID' }).eq('id', orderId);
    await admin.from('payments').update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      raw_webhook: body,
    }).eq('order_id', orderId);

    return NextResponse.json({ success: true, mode: 'mock' });
  }

  // ── Production: GB Prime Pay webhook ──────────────────────
  // Verify signature
  const crypto = require('crypto');
  const token = process.env.GBPAY_TOKEN!;
  const rawBody = JSON.stringify(body);
  const expectedSig = crypto.createHmac('sha256', token).update(rawBody).digest('hex');
  const receivedSig = request.headers.get('x-gbprimepay-signature');

  if (receivedSig !== expectedSig) {
    console.error('[GBPay Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse GB Prime Pay payload
  const { referenceNo, resultCode, amount } = body;
  if (resultCode !== '00') {
    // Payment failed
    console.log(`[GBPay Webhook] Payment failed for ref: ${referenceNo}`);
    return NextResponse.json({ received: true });
  }

  // Find payment by reference
  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('payments')
    .update({
      status: 'PAID',
      reference_no: referenceNo,
      paid_at: new Date().toISOString(),
      raw_webhook: body,
    })
    .eq('gbpay_token', referenceNo)
    .select('order_id')
    .single();

  if (payment?.order_id) {
    // Update order status to PAID
    await admin.from('orders')
      .update({ status: 'PAID' })
      .eq('id', payment.order_id);

    // Trigger LINE notification via Supabase Edge Function (if enabled)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      fetch(`${supabaseUrl}/functions/v1/line-notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: payment.order_id,
          event: 'PAID',
          amount,
        }),
      }).catch(console.error); // fire-and-forget
    }
  }

  return NextResponse.json({ received: true });
}
