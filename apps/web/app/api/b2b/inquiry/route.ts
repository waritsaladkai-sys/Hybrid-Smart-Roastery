import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase';
import { sendAdminB2BAlert } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, contactName, phone, email, lineId, monthlyKg, products, note } = body;

    if (!businessName || !contactName || !phone) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็น' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('b2b_inquiries')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        phone,
        email: email || null,
        line_id: lineId || null,
        monthly_kg: monthlyKg,
        products: products || [],
        note: note || null,
        status: 'NEW',
      })
      .select()
      .single();

    if (error) {
      console.error('B2B inquiry insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send admin alert (non-blocking)
    sendAdminB2BAlert({ businessName, contactName, phone, monthlyKg }).catch(console.error);

    return NextResponse.json({ inquiry: data }, { status: 201 });
  } catch (err) {
    console.error('B2B inquiry error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}

export async function GET() {
  // Admin only — list all inquiries
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('b2b_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiries: data });
}
