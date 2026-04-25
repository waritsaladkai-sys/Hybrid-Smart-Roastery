import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '../../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const admin = createAdminClient();
    
    // Verify order exists
    const { data: order, error: orderError } = await admin.from('orders').select('id, user_id').eq('id', id).single();
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const fileName = `${id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await admin
      .storage
      .from('payment-slips')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = admin.storage.from('payment-slips').getPublicUrl(fileName);
    const slipUrl = publicUrlData.publicUrl;

    // Update payments table
    await admin.from('payments').update({ slip_url: slipUrl }).eq('order_id', id);

    // Update order status
    await admin.from('orders').update({ status: 'PENDING_REVIEW' }).eq('id', id);

    return NextResponse.json({ success: true, slipUrl });
  } catch (error) {
    console.error('Slip upload exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
