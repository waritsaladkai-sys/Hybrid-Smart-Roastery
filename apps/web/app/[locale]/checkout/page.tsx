'use client';

import { useState, useEffect, use } from 'react';
import { useCart } from '../../../contexts/cart.context';
import { Navbar } from '../../../components/ui/Navbar';

type Step = 'address' | 'payment' | 'success';

interface Address {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
}

// All 77 Thai provinces + กรุงเทพมหานคร
const PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร',
  'ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท',
  'ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง',
  'ตราด','ตาก','นครนายก','นครปฐม','นครพนม',
  'นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส',
  'น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์',
  'ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา',
  'พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์',
  'แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน',
  'ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง',
  'ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย',
  'ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ',
  'สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี',
  'สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย',
  'หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์',
  'อุทัยธานี','อุบลราชธานี',
];

// Generate PromptPay QR via qr-code API (uses promptpay format)
// PromptPay ID for Eight Coffee: 0812345678 (replace with real number)
// KBank Account Info (Eight Coffee Roasters)
const BANK_INFO = {
  bankName: 'ธนาคารกสิกรไทย (KBank)',
  bankColor: '#138f2d',
  accountNumber: '106-2-82794-3',
  accountName: 'นายวริทธิ์ ปรินายวนิชย์',
  logo: 'K',
};

export default function CheckoutPage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
  const params = use(paramsPromise);
  const locale = params?.locale ?? 'th';
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [addr, setAddr] = useState<Address>({
    fullName: '', phone: '', address: '', district: '',
    province: 'กรุงเทพมหานคร', postalCode: '',
  });
  const [countdown, setCountdown] = useState(900); // 15 min
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState('');

  const shipping = total >= 500 ? 0 : 50;
  const grandTotal = total + shipping;

  // QR countdown
  useEffect(() => {
    if (step !== 'payment') return;
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  const isAddrValid = addr.fullName && addr.phone && addr.address && addr.postalCode;

  // Create order in Supabase when proceeding to payment
  const handleProceedToPayment = async () => {
    setSubmitting(true);
    setOrderError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            recipient_name: addr.fullName,
            phone: addr.phone,
            address_line: addr.address,
            district: addr.district,
            province: addr.province,
            postal_code: addr.postalCode,
          },
          items: items.map(item => ({
            product_id: item.productId ?? item.id,
            variant_id: item.variantId ?? item.id,
            product_name_th: item.nameTh,
            weight_gram: item.weightGram ?? 250,
            unit_price: item.price,
            quantity: item.quantity,
          })),
          note: null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.order?.id ?? null);
      }
      // Proceed to payment step even if API fails (guest checkout)
      setStep('payment');
    } catch {
      // Proceed anyway - order may be saved without auth
      setStep('payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm payment (customer pressed "ชำระเงินแล้ว")
  const handlePaymentConfirmed = () => {
    clear();
    setStep('success');
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <>
        <Navbar locale={locale} />
        <main style={{ paddingTop: '5rem' }}>
          <div className="container section" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>ตะกร้าว่างเปล่า</h2>
            <a href={`/${locale}/products`} className="btn btn-dark">เลือกซื้อกาแฟ →</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar locale={locale} />
      <main style={{ paddingTop: '5rem' }}>
        <div className="container section-sm">

          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem', maxWidth: '400px' }}>
            {(['address', 'payment', 'success'] as Step[]).map((s, i) => {
              const labels = ['ที่อยู่', 'ชำระเงิน', 'สำเร็จ'];
              const done = ['address', 'payment', 'success'].indexOf(step) > i;
              const current = step === s;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'var(--ink-900)' : current ? 'var(--accent)' : 'var(--bg-warm)',
                      color: done || current ? '#fff' : 'var(--ink-500)',
                      fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.3s',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: current ? 'var(--ink-900)' : 'var(--ink-500)', fontWeight: current ? 600 : 400 }}>{labels[i]}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 1, background: done ? 'var(--ink-900)' : 'var(--border)', margin: '0 0.5rem', marginBottom: '1.25rem', transition: 'all 0.3s' }} />}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Address ── */}
          {step === 'address' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '2rem' }}>ที่อยู่จัดส่ง</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'ชื่อ-นามสกุล', key: 'fullName', type: 'text', placeholder: 'สมชาย ใจดี' },
                    { label: 'เบอร์โทรศัพท์', key: 'phone', type: 'tel', placeholder: '08x-xxx-xxxx' },
                    { label: 'ที่อยู่ (บ้านเลขที่ ถนน แขวง/ตำบล)', key: 'address', type: 'text', placeholder: '123/4 ถนนสุขุมวิท แขวงคลองตัน' },
                    { label: 'เขต/อำเภอ', key: 'district', type: 'text', placeholder: 'วัฒนา' },
                    { label: 'รหัสไปรษณีย์', key: 'postalCode', type: 'text', placeholder: '10110', maxLength: 5 },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--ink-500)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(addr as any)[f.key]}
                        maxLength={(f as any).maxLength}
                        onChange={(e) => setAddr({ ...addr, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', font: 'inherit', fontSize: '0.95rem', background: 'var(--bg-white)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--ink-900)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        id={`checkout-${f.key}`}
                      />
                    </div>
                  ))}

                  {/* Province — all 77 */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--ink-500)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>จังหวัด</label>
                    <select value={addr.province} onChange={(e) => setAddr({ ...addr, province: e.target.value })}
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', font: 'inherit', fontSize: '0.95rem', background: 'var(--bg-white)', outline: 'none' }}
                      id="checkout-province"
                    >
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {orderError && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-sm)', fontSize: '0.85rem', color: '#ef4444' }}>
                    ⚠ {orderError}
                  </div>
                )}

                <button
                  className="btn btn-dark"
                  style={{ marginTop: '2rem', width: '100%', justifyContent: 'center', opacity: isAddrValid && !submitting ? 1 : 0.4 }}
                  disabled={!isAddrValid || submitting}
                  onClick={handleProceedToPayment}
                  id="proceed-to-payment"
                >
                  {submitting ? 'กำลังสร้างออเดอร์...' : 'ดำเนินการชำระเงิน →'}
                </button>
              </div>

              {/* Mini order summary */}
              <div className="cart-summary" style={{ position: 'sticky', top: '6rem' }}>
                <div className="cs-title">สรุปรายการ</div>
                {items.map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{i.nameTh} {i.weightGram}g × {i.quantity}</span>
                    <span>฿{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="cs-row" style={{ marginTop: '0.75rem' }}>
                  <span>ค่าส่ง Flash Express</span>
                  <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>{shipping === 0 ? 'ฟรี' : `฿${shipping}`}</span>
                </div>
                <div className="cs-row total">
                  <span>ยอดชำระ</span>
                  <span className="cs-val">฿{grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', color: '#15803d' }}>
                  {total >= 500 ? '✓ ฟรีค่าส่ง (ซื้อ ฿500+)' : `อีก ฿${500 - total} รับฟรีค่าส่ง`}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: QR Payment ── */}
          {step === 'payment' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>สแกน QR ชำระเงิน</h2>
                <p style={{ color: 'var(--ink-500)', marginBottom: '2rem' }}>
                  ใช้แอปธนาคารหรือ Mobile Banking สแกน QR ด้านล่าง
                </p>

                {/* Thai QR Payment — KBank */}
                <div style={{ display: 'inline-block', background: '#fff', border: '2px solid #e8e2da', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: '280px' }}>
                  
                  {/* KBank Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', background: BANK_INFO.bankColor, borderRadius: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: BANK_INFO.bankColor, fontSize: '1rem' }}>{BANK_INFO.logo}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Thai QR Payment</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>{BANK_INFO.bankName}</div>
                    </div>
                  </div>

                  {/* Static PromptPay QR Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qr-kbank.png"
                    alt="Thai QR Payment - กสิกรไทย"
                    width={220}
                    height={220}
                    style={{ display: 'block', margin: '0 auto', borderRadius: '0.5rem' }}
                  />

                  {/* Amount + Account */}
                  <div style={{ marginTop: '1rem', textAlign: 'center', borderTop: '1px solid #eee9e3', paddingTop: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#1c1814' }}>
                      ฿{grandTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1c1814', marginTop: '0.35rem' }}>{BANK_INFO.accountName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b6560', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      บัญชี {BANK_INFO.accountNumber}
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: countdown > 60 ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--ink-500)' }}>QR หมดอายุใน <strong style={{ color: countdown < 60 ? '#ef4444' : 'var(--ink-900)' }}>{mm}:{ss}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep('address')}>← แก้ไขที่อยู่</button>
                  <button
                    className="btn btn-dark"
                    onClick={handlePaymentConfirmed}
                    id="confirm-payment-btn"
                  >
                    ✓ ชำระเงินแล้ว
                  </button>
                </div>

                {/* Bank Transfer Alternative */}
                <div style={{ background: '#f9f6f2', border: '1px solid #eee9e3', borderRadius: 'var(--r-sm)', padding: '1.25rem 1.5rem', fontSize: '0.85rem', textAlign: 'left', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, color: '#1c1814', marginBottom: '0.75rem' }}>📋 วิธีชำระเงิน</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#3a3530' }}>
                    <div>1️⃣ สแกน QR ด้านบนผ่าน Mobile Banking ทุกธนาคาร</div>
                    <div style={{ paddingLeft: '1.5rem', color: '#6b6560', fontSize: '0.8rem' }}>หรือโอนโดยตรงมาที่:</div>
                    <div style={{ background: '#fff', border: '1px solid #eee9e3', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600, color: BANK_INFO.bankColor }}>{BANK_INFO.bankName}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.08em', margin: '0.25rem 0' }}>{BANK_INFO.accountNumber}</div>
                      <div style={{ color: '#6b6560' }}>{BANK_INFO.accountName}</div>
                    </div>
                    <div>2️⃣ ยืนยันจำนวนเงิน <strong style={{ color: '#C17F4A' }}>฿{grandTotal.toLocaleString()}</strong></div>
                    <div>3️⃣ กด <strong>&quot;ชำระเงินแล้ว&quot;</strong> เพื่อยืนยันออเดอร์</div>
                  </div>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee9e3', fontSize: '0.78rem', color: '#9b8f87' }}>
                    ⓘ ทีมงานจะตรวจสอบยอดเงินและยืนยันออเดอร์ภายใน 1–2 ชั่วโมงในวันทำการ
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <div className="cs-title">ที่อยู่จัดส่ง</div>
                <div style={{ font: 'inherit', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ink-700)', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <strong>{addr.fullName}</strong><br />
                  📞 {addr.phone}<br />
                  {addr.address}<br />
                  {addr.district && `${addr.district}, `}{addr.province} {addr.postalCode}
                </div>
                <div className="cs-title" style={{ fontSize: '1rem' }}>รายการสินค้า</div>
                {items.map((i) => (
                  <div key={i.id} className="cs-row" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{i.nameTh} {i.weightGram}g ×{i.quantity}</span>
                    <span>฿{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="cs-row" style={{ color: shipping === 0 ? '#15803d' : undefined }}>
                  <span>ค่าส่ง</span>
                  <span>{shipping === 0 ? 'ฟรี' : `฿${shipping}`}</span>
                </div>
                <div className="cs-row total">
                  <span>รวมทั้งสิ้น</span>
                  <span className="cs-val">฿{grandTotal.toLocaleString()}</span>
                </div>
                {orderId && (
                  <div style={{ marginTop: '1rem', padding: '0.6rem 0.85rem', background: '#f0fdf4', borderRadius: '0.5rem', fontSize: '0.78rem', color: '#15803d' }}>
                    ✓ ออเดอร์ #{orderId.slice(-8).toUpperCase()} ถูกบันทึกแล้ว
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto', padding: '4rem 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.75rem' }}>รับออเดอร์แล้ว!</h2>
              <p style={{ color: 'var(--ink-500)', marginBottom: '2rem', lineHeight: 1.7 }}>
                ขอบคุณที่ซื้อกาแฟจาก Eight Coffee Roasters<br />
                ทีมงานจะตรวจสอบการชำระและเริ่มคั่วกาแฟให้ทันที<br />
                คาดว่าจะได้รับสินค้าภายใน <strong>3–5 วันทำการ</strong>
              </p>
              <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                {orderId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600 }}>เลขที่ออเดอร์</span>
                    <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.9rem' }}>#{orderId.slice(-8).toUpperCase()}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)', lineHeight: 1.8 }}>
                  📦 คั่วสด → พักแก๊ส → จัดแพ็ค → Flash Express 48h<br />
                  🔔 แจ้งเตือนทุกขั้นตอนผ่าน LINE OA<br />
                  📍 ตรวจสอบสถานะได้ที่หน้า &quot;ติดตามออเดอร์&quot;
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a href={`/${locale}/orders`} className="btn btn-outline">ติดตามออเดอร์</a>
                <a href={`/${locale}/products`} className="btn btn-dark">เลือกซื้อต่อ →</a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
