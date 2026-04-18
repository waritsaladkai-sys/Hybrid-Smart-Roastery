import Deno from 'https://deno.land/std@0.168.0/node/module.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { orderId, event, amount, trackingNumber } = await req.json();

  const LINE_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  if (!LINE_TOKEN) {
    return new Response('LINE token not configured', { status: 500 });
  }

  // Build message based on event
  const messages: Record<string, string> = {
    PAID: `✅ ออเดอร์ชำระเงินแล้ว!\nOrder: ${orderId}\nยอด: ฿${amount?.toLocaleString()}\n\nกรุณาดำเนินการคั่วกาแฟ`,
    ROASTING: `🔥 เริ่มคั่วกาแฟสำหรับ Order: ${orderId}`,
    SHIPPED: `🚚 จัดส่งแล้ว!\nOrder: ${orderId}\nTracking: ${trackingNumber ?? 'N/A'}`,
    LOW_STOCK: `⚠️ สต็อกสารกาแฟต่ำ!\nLot: ${orderId}\nเหลือ: ${amount}kg`,
  };

  const text = messages[event] ?? `📦 Order ${orderId}: ${event}`;

  // Send to LINE OA admin group
  const lineRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text }],
    }),
  });

  if (!lineRes.ok) {
    const err = await lineRes.text();
    return new Response(`LINE error: ${err}`, { status: 500 });
  }

  return new Response(JSON.stringify({ sent: true, event }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
