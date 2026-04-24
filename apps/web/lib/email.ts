import { Resend } from 'resend';

// Initialize with dummy if missing during build, to prevent crash
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const FROM = 'Eight Coffee Roasters <noreply@eightcoffee.co.th>';
const ADMIN_EMAIL = 'admin@eightcoffee.co.th';

// ── Order Confirmation ────────────────────────────────
export async function sendOrderConfirmation({
  to,
  orderId,
  customerName,
  items,
  total,
}: {
  to: string;
  orderId: string;
  customerName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
}) {
  if (!process.env.RESEND_API_KEY || !to) return;

  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">×${i.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">฿${(i.price * i.qty).toLocaleString()}</td>
        </tr>`,
    )
    .join('');

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ ยืนยันคำสั่งซื้อ #${orderId} — Eight Coffee Roasters`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c1814">
        <div style="background:#1c1814;padding:32px;text-align:center">
          <h1 style="color:#C17F4A;font-size:24px;margin:0">Eight Coffee Roasters</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">Specialty Coffee · Thailand</p>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px">สั่งซื้อสำเร็จ!</h2>
          <p style="color:#6b6560">สวัสดีคุณ ${customerName},</p>
          <p style="color:#6b6560">เราได้รับคำสั่งซื้อ <strong style="color:#1c1814">#${orderId}</strong> เรียบร้อยแล้ว 
          ทีมงานจะตรวจสอบการชำระเงินและเริ่มคั่วกาแฟสดสำหรับคุณโดยเร็ว</p>
          
          <table style="width:100%;border-collapse:collapse;margin:24px 0;border:1px solid #eee;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f9f6f2">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b6560;text-transform:uppercase">สินค้า</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b6560;text-transform:uppercase">จำนวน</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b6560;text-transform:uppercase">ราคา</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background:#f9f6f2">
                <td colspan="2" style="padding:12px;text-align:right;font-weight:700">รวมทั้งสิ้น</td>
                <td style="padding:12px;text-align:right;font-weight:700;font-size:18px;color:#C17F4A">฿${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0;color:#166534;font-size:14px">
              📨 ทีมงานจะติดต่อกลับเมื่อตรวจสอบยอดเงินแล้ว (ภายใน 1–2 ชั่วโมงในวันทำการ)
            </p>
          </div>

          <p style="color:#6b6560;font-size:13px">
            หากมีคำถาม ติดต่อเราได้ที่ LINE OA: <strong>@eightcoffee</strong> 
            หรือโทร <strong>080-479-0489</strong>
          </p>
        </div>
        <div style="background:#f9f6f2;padding:16px;text-align:center;font-size:12px;color:#9b8f87">
          © Eight Coffee Roasters · คั่วสดทุก Lot · ส่งทั่วไทย
        </div>
      </div>
    `,
  });
}

// ── Admin New Order Alert ─────────────────────────────
export async function sendAdminOrderAlert({
  orderId,
  customerName,
  phone,
  total,
  province,
}: {
  orderId: string;
  customerName: string;
  phone: string;
  total: number;
  province: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🛒 ออเดอร์ใหม่ #${orderId} — ฿${total.toLocaleString()}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1c1814">ออเดอร์ใหม่เข้ามา!</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#6b6560;width:120px">Order ID</td><td><strong>${orderId}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">ลูกค้า</td><td>${customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">โทร</td><td>${phone}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">จังหวัด</td><td>${province}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">ยอด</td><td><strong style="color:#C17F4A;font-size:18px">฿${total.toLocaleString()}</strong></td></tr>
        </table>
        <a href="https://hybrid-smart-roastery-web.vercel.app/th/admin/orders" 
           style="display:inline-block;margin-top:16px;background:#1c1814;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          จัดการออเดอร์ →
        </a>
      </div>
    `,
  });
}

// ── Admin B2B Inquiry Alert ───────────────────────────
export async function sendAdminB2BAlert({
  businessName,
  contactName,
  phone,
  monthlyKg,
}: {
  businessName: string;
  contactName: string;
  phone: string;
  monthlyKg: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🤝 B2B Inquiry ใหม่ — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1c1814">มีร้านค้าสนใจ Wholesale!</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#6b6560;width:130px">ชื่อร้าน/ธุรกิจ</td><td><strong>${businessName}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">ผู้ติดต่อ</td><td>${contactName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">โทร</td><td>${phone}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6560">สั่งต่อเดือน</td><td><strong>${monthlyKg} kg</strong></td></tr>
        </table>
        <a href="https://hybrid-smart-roastery-web.vercel.app/th/admin/b2b"
           style="display:inline-block;margin-top:16px;background:#C17F4A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          ดูข้อมูล B2B Inquiry →
        </a>
      </div>
    `,
  });
}
