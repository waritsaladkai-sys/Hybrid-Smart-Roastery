'use client';

import { useState, use } from 'react';
import { Navbar } from '../../../components/ui/Navbar';

const PRODUCTS = [
  { nameTh: 'เอธิโอเปีย ยิร์กาเชฟเฟ', origin: 'Ethiopia', process: 'Natural', roast: 'Light', retail: 520, tags: ['ดอกไม้', 'บลูเบอร์รี่'] },
  { nameTh: 'โคลอมเบีย อูอิลา', origin: 'Colombia', process: 'Washed', roast: 'Medium', retail: 450, tags: ['ช็อกโกแลต', 'คาราเมล'] },
  { nameTh: 'ไทย ดอยช้าง ฮันนี่', origin: 'Thailand', process: 'Honey', roast: 'Medium Light', retail: 380, tags: ['น้ำผึ้ง', 'พีช'] },
  { nameTh: 'เคนยา AA วอช', origin: 'Kenya', process: 'Washed', roast: 'Light', retail: 580, tags: ['แบล็กเคอร์แรนท์', 'มะนาว'] },
  { nameTh: 'บราซิล เซอร์ราโด', origin: 'Brazil', process: 'Natural', roast: 'Medium Dark', retail: 350, tags: ['ช็อกโกแลต', 'ถั่ว'] },
];

const TIERS = [
  { label: 'Starter', kg: '1–4 kg', discount: 20, shipping: 250, desc: 'เริ่มต้นทดลองสินค้า' },
  { label: 'Regular', kg: '5–19 kg', discount: 22, shipping: 150, desc: 'สำหรับร้านกาแฟขนาดเล็ก' },
  { label: 'Partner', kg: '20–49 kg', discount: 25, shipping: 0, desc: 'ร้านกาแฟขนาดกลาง ส่งฟรี' },
  { label: 'Premium', kg: '50 kg+', discount: 28, shipping: 0, desc: 'โรงงาน/Distributor ส่งฟรี' },
];

const FAQS = [
  { q: 'MOQ คืออะไร?', a: 'Minimum Order Quantity หรือปริมาณขั้นต่ำในการสั่ง สำหรับ B2B เริ่มต้นที่ 1 kg ต่อ SKU' },
  { q: 'กาแฟคั่วสดจริงไหม?', a: 'คั่วทุกออเดอร์ภายใน 24–48 ชั่วโมงก่อนจัดส่ง พร้อม Lot Number และวันที่คั่วบนบรรจุภัณฑ์' },
  { q: 'มีบริการ Private Label ไหม?', a: 'มี! พิมพ์ Logo ร้านบนบรรจุภัณฑ์ขั้นต่ำ 5 kg ราคาแยกต่างหาก กรุณาติดต่อทีมงาน' },
  { q: 'ส่งต่างจังหวัดได้ไหม?', a: 'ส่งทั่วไทยผ่าน Flash Express มาตรฐาน 48 ชั่วโมง ฟรีค่าส่งเมื่อสั่ง 20 kg ขึ้นไป' },
  { q: 'รับชำระแบบไหน?', a: 'PromptPay QR, โอนเงิน, บัตรเครดิต (เร็วๆ นี้) สำหรับลูกค้า Subscription สามารถชำระรายเดือนได้' },
];

export default function B2BPage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
  const params = use(paramsPromise);
  const locale = params?.locale ?? 'th';

  const [form, setForm] = useState({
    businessName: '', contactName: '', phone: '', email: '',
    lineId: '', monthlyKg: '5', products: [] as string[], note: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleProduct = (name: string) => {
    setForm(f => ({
      ...f,
      products: f.products.includes(name)
        ? f.products.filter(p => p !== name)
        : [...f.products, name],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/b2b/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar locale={locale} />
      <main style={{ paddingTop: '5rem' }}>

        {/* ── Hero ── */}
        <section style={{ background: '#1c1814', color: '#fff', padding: '5rem 0' }}>
          <div className="container">
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(193,127,74,0.9)', marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>
                B2B Wholesale
              </p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                กาแฟคุณภาพสูง<br />
                <em style={{ color: '#C17F4A' }}>สำหรับร้านกาแฟ</em>
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '2rem' }}>
                ราคา Wholesale พิเศษลด 20–28% พร้อมบริการ Private Label<br />
                คั่วสดทุก Lot ส่งถึงร้านคุณทั่วไทย
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="#apply" className="btn btn-accent">สมัคร Partner ฟรี →</a>
                <a href="#pricing" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>ดูราคา Wholesale</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div style={{ background: '#f5ebe0', borderBottom: '1px solid #e8d8c4' }}>
          <div className="container" style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
            {[
              { num: 'MOQ 1kg', sub: 'ขั้นต่ำต่อ SKU' },
              { num: '20%+', sub: 'ส่วนลดจาก Retail' },
              { num: 'ฟรีส่ง', sub: 'เมื่อสั่ง ≥ 20 kg' },
              { num: '48h', sub: 'ส่งทั่วไทย' },
            ].map(s => (
              <div key={s.sub} style={{ flex: '1 1 120px', padding: '1.5rem', textAlign: 'center', borderRight: '1px solid #e8d8c4' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#1c1814' }}>{s.num}</div>
                <div style={{ fontSize: '0.78rem', color: '#8a7060', marginTop: '0.2rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing Tiers ── */}
        <section className="section container" id="pricing">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="t-label" style={{ marginBottom: '0.5rem' }}>ตาราง Wholesale</p>
            <h2 className="t-h2">ราคา B2B</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {TIERS.map((tier, i) => (
              <div key={tier.label} style={{
                border: i === 2 ? '2px solid #C17F4A' : '1.5px solid #eee9e3',
                borderRadius: '1.25rem', padding: '1.75rem', background: i === 2 ? '#fdf8f4' : '#fff',
                position: 'relative',
              }}>
                {i === 2 && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C17F4A', color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.25rem 0.85rem', borderRadius: '100px' }}>
                    แนะนำ
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C17F4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{tier.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>{tier.kg}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1814', marginBottom: '0.25rem' }}>ลด {tier.discount}%</div>
                <div style={{ fontSize: '0.85rem', color: '#6b6560', marginBottom: '1rem' }}>
                  {tier.shipping === 0 ? '✓ ส่งฟรี' : `ค่าส่ง ฿${tier.shipping}`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.25rem' }}>{tier.desc}</div>
                <a href="#apply" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  เลือก {tier.label}
                </a>
              </div>
            ))}
          </div>

          {/* B2B Products */}
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>เมล็ดที่เปิดให้สั่ง Wholesale</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {PRODUCTS.map(p => {
              const wholesale20 = Math.round(p.retail * 4 * 0.80); // per kg at 20% off
              return (
                <div key={p.nameTh} style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2rem' }}>☕</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.nameTh}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b6560', marginBottom: '0.5rem' }}>{p.origin} · {p.process} · {p.roast}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {p.tags.map(t => <span key={t} style={{ padding: '0.2rem 0.55rem', background: '#f5ebe0', borderRadius: '100px', fontSize: '0.72rem', color: '#8a5832' }}>{t}</span>)}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: '#9b8f87', textDecoration: 'line-through' }}>฿{(p.retail * 4).toLocaleString()}/kg</span>
                      {' '}→{' '}
                      <strong style={{ color: '#C17F4A' }}>฿{wholesale20.toLocaleString()}/kg</strong>
                      <span style={{ fontSize: '0.72rem', color: '#22c55e', marginLeft: '0.5rem' }}>(Starter tier)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section style={{ background: '#1c1814', padding: '5rem 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(193,127,74,0.9)', marginBottom: '0.75rem' }}>สิทธิพิเศษ Partner</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#fff' }}>ทำไมต้อง Eight Coffee?</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              {[
                { icon: '🔥', title: 'คั่วสดทุก Lot', desc: 'คั่วตามออเดอร์ ไม่มีสต็อกเก่า พร้อม Lot No. และวันที่คั่ว' },
                { icon: '📊', title: 'Cupping Notes', desc: 'ได้รับรายงาน SCA Score, Flavor Profile และ Brew Recipe ทุกชุด' },
                { icon: '📦', title: 'Private Label', desc: 'พิมพ์ Logo ร้านคุณบนถุงกาแฟ (5 kg+) ดูแลแบรนด์ของคุณ' },
                { icon: '🔄', title: 'Subscription', desc: 'ตั้งออเดอร์รายสัปดาห์/เดือน ส่งอัตโนมัติ ลด 28%' },
                { icon: '📱', title: 'LINE OA', desc: 'รับแจ้งเตือนเมื่อคั่วเสร็จ พร้อม Tracking Number' },
                { icon: '🤝', title: 'ผู้ดูแลบัญชีส่วนตัว', desc: 'มี Account Manager ดูแลคุณตลอด รับปรึกษาเรื่อง Menu ได้เลย' },
              ].map(b => (
                <div key={b.title}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{b.icon}</div>
                  <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>{b.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Application Form ── */}
        <section className="section container" id="apply">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '4rem', alignItems: 'start' }}>
            <div>
              <p className="t-label" style={{ marginBottom: '0.75rem' }}>เริ่มต้นง่ายๆ</p>
              <h2 className="t-h2">สมัคร Partner<br />ฟรีทันที</h2>
              <p className="t-body" style={{ marginTop: '1rem', lineHeight: 1.75 }}>
                กรอกฟอร์มด้านขวา ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง<br />
                เพื่อยืนยันบัญชีและส่ง Price List เฉพาะ Partner ให้คุณ
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  '✓ สมัครฟรี ไม่มีค่าธรรมเนียม',
                  '✓ รับ Price List ฉบับ Wholesale',
                  '✓ ทดลองสั่ง 1 kg ก่อนได้เลย',
                  '✓ ยกเลิกหรือหยุดสั่งเมื่อไหรก็ได้',
                ].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#3a3530' }}>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {submitted ? (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '0.75rem', color: '#15803d' }}>
                  รับใบสมัครแล้ว!
                </h3>
                <p style={{ color: '#166534', lineHeight: 1.7 }}>
                  ทีมงานจะติดต่อกลับไปที่ <strong>{form.email || form.phone}</strong><br />
                  ภายใน 24 ชั่วโมง (วันทำการ)<br /><br />
                  ระหว่างนี้สามารถทดลองสั่งซื้อ B2C ได้เลยที่หน้าสินค้า
                </p>
                <a href={`/${locale}/products`} className="btn btn-dark" style={{ marginTop: '1.5rem' }}>
                  ดูสินค้า →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'ชื่อร้าน / ธุรกิจ *', key: 'businessName', type: 'text', placeholder: 'Coffee Shop ABC', required: true },
                  { label: 'ชื่อผู้ติดต่อ *', key: 'contactName', type: 'text', placeholder: 'คุณสมชาย', required: true },
                  { label: 'เบอร์โทรศัพท์ *', key: 'phone', type: 'tel', placeholder: '08x-xxx-xxxx', required: true },
                  { label: 'อีเมล', key: 'email', type: 'email', placeholder: 'hello@mycafe.com', required: false },
                  { label: 'LINE ID', key: 'lineId', type: 'text', placeholder: '@mycafe', required: false },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      required={f.required}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #eee9e3', borderRadius: '0.5rem', font: 'inherit', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#1c1814'}
                      onBlur={e => e.target.style.borderColor = '#eee9e3'}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                    ปริมาณที่ต้องการต่อเดือน (kg)
                  </label>
                  <select value={form.monthlyKg} onChange={e => setForm(p => ({ ...p, monthlyKg: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #eee9e3', borderRadius: '0.5rem', font: 'inherit', fontSize: '0.9rem', background: '#fff', outline: 'none' }}>
                    {['1–4', '5–19', '20–49', '50+'].map(v => <option key={v} value={v}>{v} kg/เดือน</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    เมล็ดที่สนใจ (เลือกได้หลายรายการ)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {PRODUCTS.map(p => (
                      <label key={p.nameTh} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '0.5rem', background: form.products.includes(p.nameTh) ? '#fdf8f4' : 'transparent' }}>
                        <input type="checkbox" checked={form.products.includes(p.nameTh)} onChange={() => toggleProduct(p.nameTh)}
                          style={{ accentColor: '#C17F4A', width: 16, height: 16 }} />
                        {p.nameTh} <span style={{ fontSize: '0.78rem', color: '#9b8f87' }}>({p.roast})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>หมายเหตุเพิ่มเติม</label>
                  <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="เช่น ต้องการ Private Label, ต้องการ Subscription รายสัปดาห์..."
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #eee9e3', borderRadius: '0.5rem', font: 'inherit', fontSize: '0.9rem', resize: 'vertical', outline: 'none' }}
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn btn-dark" style={{ justifyContent: 'center', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'กำลังส่ง...' : 'ส่งใบสมัคร Partner →'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: '#f9f6f2', padding: '5rem 0' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 className="t-h2">คำถามที่ถามบ่อย</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1rem', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '1.25rem 1.5rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'inherit', fontSize: '0.95rem', fontWeight: 600, color: '#1c1814' }}
                  >
                    {faq.q}
                    <span style={{ fontSize: '1.25rem', color: '#C17F4A', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.9rem', color: '#6b6560', lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#C17F4A', padding: '4rem 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#fff', marginBottom: '1rem' }}>
              พร้อมเริ่มต้นแล้ว?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>ไม่มีค่าสมัคร สั่งเมื่อพร้อม ยกเลิกเมื่อไหรก็ได้</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="#apply" style={{ background: '#fff', color: '#1c1814', padding: '0.9rem 2rem', borderRadius: '100px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                สมัครเลย →
              </a>
              <a href={`/${locale}/products`} style={{ border: '2px solid rgba(255,255,255,0.5)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '100px', textDecoration: 'none', fontSize: '0.95rem' }}>
                ดูสินค้าก่อน
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
