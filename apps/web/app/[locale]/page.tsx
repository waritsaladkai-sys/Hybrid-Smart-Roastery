'use client';
import { useEffect, useRef, useState } from 'react';

const PRODUCTS = [
  {
    slug: 'ethiopia-yirgacheffe-natural',
    origin: 'Ethiopia · Yirgacheffe', process: 'Natural', roast: 'Light',
    nameTh: 'เอธิโอเปีย ยิร์กาเชฟเฟ เนเชอรัล',
    tags: ['ดอกไม้', 'บลูเบอร์รี่', 'น้ำผึ้ง'], price: 520, weight: 250, isNew: true,
    sweet: 4.0, sour: 3.5, body: 2.0, aroma: 5.0, bitter: 1.0,
    mood: ['fruity', 'floral', 'light'], brew: ['Pour Over', 'AeroPress'],
  },
  {
    slug: 'colombia-huila-washed',
    origin: 'Colombia · Huila', process: 'Washed', roast: 'Medium',
    nameTh: 'โคลอมเบีย อูอิลา วอช',
    tags: ['ช็อกโกแลต', 'คาราเมล', 'เฮเซลนัต'], price: 450, weight: 250, isNew: false,
    sweet: 4.0, sour: 2.0, body: 4.5, aroma: 3.5, bitter: 2.5,
    mood: ['chocolate', 'balanced', 'nutty'], brew: ['Espresso', 'Moka Pot', 'Pour Over'],
  },
  {
    slug: 'thailand-doi-chang-honey',
    origin: 'Thailand · Doi Chang', process: 'Honey', roast: 'Medium Light',
    nameTh: 'ไทย ดอยช้าง ฮันนี่',
    tags: ['น้ำผึ้ง', 'พีช', 'อ้อย'], price: 380, weight: 250, isNew: false,
    sweet: 4.5, sour: 1.5, body: 3.0, aroma: 3.5, bitter: 1.5,
    mood: ['sweet', 'mild', 'fruity'], brew: ['Pour Over', 'Cold Brew', 'Drip'],
  },
  {
    slug: 'kenya-aa-washed',
    origin: 'Kenya · Nyeri', process: 'Washed', roast: 'Light',
    nameTh: 'เคนยา AA วอช',
    tags: ['แบล็กเคอร์แรนท์', 'มะนาว', 'ดอกไม้'], price: 580, weight: 250, isNew: false,
    sweet: 3.0, sour: 5.0, body: 2.5, aroma: 4.5, bitter: 1.0,
    mood: ['fruity', 'bright', 'complex'], brew: ['Pour Over', 'AeroPress'],
  },
  {
    slug: 'brazil-cerrado-natural',
    origin: 'Brazil · Cerrado', process: 'Natural', roast: 'Medium Dark',
    nameTh: 'บราซิล เซอร์ราโด เนเชอรัล',
    tags: ['ช็อกโกแลต', 'ถั่ว', 'คาราเมล'], price: 350, weight: 250, isNew: false,
    sweet: 3.5, sour: 1.0, body: 5.0, aroma: 3.0, bitter: 3.5,
    mood: ['chocolate', 'heavy', 'espresso'], brew: ['Espresso', 'Latte', 'Moka Pot'],
  },
];

const PROCESS_MAP: Record<string, string> = {
  Natural: 'เนเชอรัล', Washed: 'วอช', Honey: 'ฮันนี่', Anaerobic: 'แอนแอโรบิก',
};

// Simple SVG radar chart
function FlavorRadar({ product }: { product: typeof PRODUCTS[0] }) {
  const cx = 80, cy = 80, r = 60;
  const labels = ['หวาน', 'เปรี้ยว', 'บอดี้', 'กลิ่น', 'ขม'];
  const values = [product.sweet, product.sour, product.body, product.aroma, product.bitter];
  const n = labels.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const px = (val: number, i: number) => cx + (r * val / 5) * Math.cos(angle(i));
  const py = (val: number, i: number) => cy + (r * val / 5) * Math.sin(angle(i));

  const polygon = values.map((v, i) => `${px(v, i)},${py(v, i)}`).join(' ');

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* Grid */}
      {[1, 2, 3, 4, 5].map(level => (
        <polygon key={level}
          points={Array.from({ length: n }, (_, i) => `${px(level, i)},${py(level, i)}`).join(' ')}
          fill="none" stroke="#e8e2da" strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {labels.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={px(5, i)} y2={py(5, i)} stroke="#e8e2da" strokeWidth="1" />
      ))}
      {/* Values */}
      <polygon points={polygon} fill="rgba(193,127,74,0.25)" stroke="#C17F4A" strokeWidth="2" />
      {/* Labels */}
      {labels.map((label, i) => (
        <text key={i} x={px(5.8, i)} y={py(5.8, i)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#6b6560" fontFamily="Sarabun, sans-serif">
          {label}
        </text>
      ))}
    </svg>
  );
}

// Bean Selector quiz
const QUIZ_STEPS = [
  {
    q: 'คุณชอบกาแฟแบบไหน?',
    opts: [
      { label: '🍑 หวาน ไม่เปรี้ยว', val: 'sweet' },
      { label: '🍋 เปรี้ยวสดชื่น ผลไม้', val: 'fruity' },
      { label: '🍫 ช็อกโกแลต เข้ม', val: 'chocolate' },
      { label: '🌸 กลิ่นดอกไม้ บาง', val: 'floral' },
    ],
  },
  {
    q: 'ดื่มแบบไหนบ่อยที่สุด?',
    opts: [
      { label: '☕ Pour Over / Drip', val: 'Pour Over' },
      { label: '🫙 AeroPress', val: 'AeroPress' },
      { label: '☕ Espresso / Latte', val: 'Espresso' },
      { label: '🧊 Cold Brew', val: 'Cold Brew' },
    ],
  },
];

function BeanSelector() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<typeof PRODUCTS[0] | null>(null);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, val];
    if (step < QUIZ_STEPS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // Score products
      const [mood, brew] = newAnswers;
      const scored = PRODUCTS.map(p => ({
        product: p,
        score: (p.mood.includes(mood) ? 3 : 0) + (p.brew.includes(brew) ? 2 : 0),
      })).sort((a, b) => b.score - a.score);
      setResult(scored[0].product);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) return (
    <div style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: '#C17F4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        เหมาะกับคุณที่สุด
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
        {result.nameTh}
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <FlavorRadar product={result} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {result.tags.map(t => (
          <span key={t} style={{ padding: '0.3rem 0.8rem', background: '#f5ebe0', borderRadius: '100px', fontSize: '0.8rem', color: '#8a5832' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <a href={`/th/products/${result.slug}`} className="btn btn-dark">สั่งซื้อ ฿{result.price} →</a>
        <button onClick={reset} className="btn btn-outline">ลองใหม่</button>
      </div>
    </div>
  );

  const current = QUIZ_STEPS[step];
  return (
    <div style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1.5rem', padding: '2rem' }}>
      <div style={{ fontSize: '0.75rem', color: '#C17F4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        คำถาม {step + 1} / {QUIZ_STEPS.length}
      </div>
      <div style={{ width: '100%', height: '4px', background: '#eee9e3', borderRadius: '2px', marginBottom: '1.5rem' }}>
        <div style={{ width: `${((step) / QUIZ_STEPS.length) * 100}%`, height: '100%', background: '#C17F4A', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>{current.q}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {current.opts.map(opt => (
          <button key={opt.val} onClick={() => handleAnswer(opt.val)}
            style={{ padding: '0.85rem', border: '1.5px solid #eee9e3', borderRadius: '0.75rem', background: '#fafaf9', cursor: 'pointer', fontFamily: 'Sarabun, var(--font-sans)', fontSize: '0.9rem', color: '#3a3530', transition: 'all 0.2s', textAlign: 'left' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C17F4A'; (e.currentTarget as HTMLElement).style.background = '#fdf8f4'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eee9e3'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// B2B cost calculator
function CostCalculator() {
  const [kg, setKg] = useState(5);
  const [product, setProduct] = useState(PRODUCTS[1]);

  const pricePerKg = product.price * 4 * 0.78; // 250g price → per kg wholesale
  const total = kg * pricePerKg;
  const shipping = kg >= 20 ? 0 : kg >= 10 ? 150 : 250;
  const grandTotal = total + shipping;

  return (
    <div style={{ background: '#fff', border: '1.5px solid #eee9e3', borderRadius: '1.5rem', padding: '2rem' }}>
      <div style={{ fontSize: '0.75rem', color: '#C17F4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        คำนวณต้นทุน B2B
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#6b6560', display: 'block', marginBottom: '0.4rem' }}>เลือกเมล็ดกาแฟ</label>
        <select value={product.slug} onChange={e => setProduct(PRODUCTS.find(p => p.slug === e.target.value) ?? PRODUCTS[0])}
          style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #eee9e3', borderRadius: '0.5rem', fontFamily: 'Sarabun, inherit', fontSize: '0.9rem', color: '#3a3530', background: '#fafaf9' }}>
          {PRODUCTS.map(p => <option key={p.slug} value={p.slug}>{p.nameTh}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#6b6560', display: 'block', marginBottom: '0.4rem' }}>
          ปริมาณ: <strong style={{ color: '#1c1814' }}>{kg} kg</strong>
        </label>
        <input type="range" min={1} max={50} value={kg} onChange={e => setKg(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#C17F4A' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#b0aaa4', marginTop: '0.25rem' }}>
          <span>1 kg</span><span>เริ่มส่งฟรี 20 kg</span><span>50 kg</span>
        </div>
      </div>

      <div style={{ background: '#f9f6f2', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[
          { label: 'ราคากาแฟ', val: `฿${total.toLocaleString('th-TH', { maximumFractionDigits: 0 })}` },
          { label: `ค่าส่ง${shipping === 0 ? ' (ฟรี!)' : ''}`, val: shipping === 0 ? 'ฟรี' : `฿${shipping}`, accent: shipping === 0 },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: '#6b6560' }}>{r.label}</span>
            <span style={{ fontWeight: 500, color: r.accent ? '#22c55e' : '#1c1814' }}>{r.val}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #e8e2da', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>รวมทั้งหมด</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#C17F4A' }}>
            ฿{grandTotal.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#9b8f87' }}>
          ≈ ฿{(grandTotal / kg).toFixed(0)}/kg · ราคา Wholesale ลด 20% จาก Retail
        </div>
      </div>

      <a href="/th/b2b" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
        สมัคร B2B Partner →
      </a>
    </div>
  );
}

const MARQUEE_ITEMS = [
  'Single Origin', 'คั่วสดทุกสัปดาห์', 'Flash Express 48h',
  'PromptPay QR', 'LINE Notification', 'AI Sommelier',
  'Flavor Radar', 'Degas Tracker', 'B2B Wholesale',
];

export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) navRef.current.classList.toggle('scrolled', window.scrollY > 20);
      if (progressRef.current) {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressRef.current.style.width = `${pct}%`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div ref={progressRef} className="scroll-progress" />

      {/* ── Navigation ── */}
      <nav ref={navRef} className="nav">
        <div className="nav-brand">
          <span className="brand-name">Eight Coffee</span>
          <span className="brand-tag">Roasters</span>
        </div>
        <div className="nav-links">
          <a href="#products">สินค้า</a>
          <a href="#selector">เลือกเมล็ด</a>
          <a href="#b2b">ร้านกาแฟ</a>
          <a href="#process">ขั้นตอน</a>
        </div>
        <div className="nav-right">
          <a href="/th/products" className="btn btn-outline btn-sm">ดูสินค้าทั้งหมด</a>
          <a href="/th/cart" className="btn btn-dark btn-sm">🛒 ตะกร้า</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="section container hero" id="home">
        <div className="hero-left">
          <div className="hero-eyebrow fade-up">
            <span className="hero-dot" />
            <span className="t-label">Specialty Coffee Roasters · Since 2020</span>
          </div>

          <h1 className="hero-title fade-up delay-1">
            กาแฟ<br />
            <em>คั่วสด</em><br />
            ส่งตรง
          </h1>

          <p className="hero-desc fade-up delay-2">
            คัดสรร Single Origin จากแหล่งผลิตชั้นนำทั่วโลก<br />
            คั่วสดทุกล็อต พร้อมส่งถึงบ้านและร้านกาแฟทั่วไทย
          </p>

          <div className="hero-cta fade-up delay-3">
            <a href="/th/products" className="btn btn-dark">เลือกซื้อกาแฟ →</a>
            <a href="#selector" className="btn btn-outline">ช่วยเลือกเมล็ด</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <div className="hero-visual-inner">
              <span className="hero-coffee-emoji">☕</span>
            </div>
            <div className="hero-badge-float top-left">
              <div className="hbf-label">คั่วล่าสุด</div>
              <div className="hbf-value">วันนี้</div>
              <div className="hbf-sub">Ethiopia Lot #42</div>
            </div>
            <div className="hero-badge-float bottom-right">
              <div className="hbf-label">จัดส่ง Flash Express</div>
              <div className="hbf-value">48h</div>
              <div className="hbf-sub">ทั่วประเทศไทย</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        {[
          { num: '6+', lbl: 'Single Origins' },
          { num: 'B2B', lbl: 'ราคาพิเศษสำหรับร้าน' },
          { num: 'MOQ 1kg', lbl: 'ขั้นต่ำสำหรับ Wholesale' },
          { num: '48h', lbl: 'จัดส่งทั่วไทย' },
        ].map((s) => (
          <div key={s.lbl} className="stat-item">
            <div className="stat-num">{s.num}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Marquee ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot">✦</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Products + Flavor Chart ── */}
      <section className="section container" id="products">
        <div className="products-header">
          <div>
            <p className="t-label" style={{ marginBottom: '0.5rem' }}>Single Origin Collection</p>
            <h2 className="t-h2">เมล็ดกาแฟทั้งหมด</h2>
          </div>
          <a href="/th/products" className="btn btn-outline">ดูทั้งหมด →</a>
        </div>

        {/* Flavor Explorer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '3rem', alignItems: 'start' }}>
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {PRODUCTS.map((p) => (
              <a key={p.slug} href={`/th/products/${p.slug}`} className="product-card"
                onClick={(e) => { e.preventDefault(); setSelectedProduct(p); }}
                style={{ cursor: 'pointer', outline: selectedProduct.slug === p.slug ? '2px solid #C17F4A' : 'none' }}>
                <div className="product-img">
                  <span className="product-img-emoji">☕</span>
                  <span className="product-origin-badge">{p.origin}</span>
                  {p.isNew && <span className="product-new-badge">New</span>}
                </div>
                <div className="product-body">
                  <div className="product-process">{PROCESS_MAP[p.process] ?? p.process} · {p.roast}</div>
                  <h3 className="product-name">{p.nameTh}</h3>
                  <div className="product-flavor-tags">
                    {p.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="flavor-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="product-footer-row">
                    <div className="product-price-block">
                      <div className="product-price">฿{p.price}</div>
                      <div className="product-weight">{p.weight}g</div>
                    </div>
                    <a href={`/th/products/${p.slug}`} className="btn btn-outline btn-sm">สั่งซื้อ</a>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Sticky Flavor Panel */}
          <div style={{ position: 'sticky', top: '5rem', background: '#fff', borderRadius: '1.5rem', border: '1.5px solid #eee9e3', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#C17F4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Flavor Profile
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#1c1814' }}>
              {selectedProduct.nameTh}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <FlavorRadar product={selectedProduct} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {selectedProduct.tags.map(t => (
                <span key={t} style={{ padding: '0.25rem 0.6rem', background: '#f5ebe0', borderRadius: '100px', fontSize: '0.75rem', color: '#8a5832' }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6b6560', marginBottom: '1rem' }}>
              แนะนำ: {selectedProduct.brew.join(' · ')}
            </div>
            <a href={`/th/products/${selectedProduct.slug}`} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
              สั่งซื้อ ฿{selectedProduct.price} →
            </a>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Bean Selector + Cost Calculator ── */}
      <section className="section container" id="selector">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="t-label" style={{ marginBottom: '0.5rem' }}>เครื่องมือช่วยเลือก</p>
          <h2 className="t-h2">ไม่รู้จะเลือกอะไร?</h2>
          <p className="t-body" style={{ marginTop: '0.75rem', color: 'var(--ink-500)' }}>
            ตอบคำถาม 2 ข้อ เราจะแนะนำเมล็ดที่เหมาะกับคุณ
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <BeanSelector />
          <CostCalculator />
        </div>
      </section>

      <div className="divider" />

      {/* ── B2B Section ── */}
      <section className="section container" id="b2b">
        <div className="features-layout">
          <div className="features-left">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>สำหรับร้านกาแฟและผู้ประกอบการ</p>
            <h2 className="t-h2">ราคา B2B<br />ขายส่ง</h2>
            <p className="t-body" style={{ marginTop: '1rem', maxWidth: '38ch', lineHeight: 1.7 }}>
              เปิดบัญชี Partner เพื่อรับราคา Wholesale พิเศษ
              ลด 20-25% จากราคา Retail พร้อม Degas Guarantee ทุกล็อต
            </p>
            <div className="features-list" style={{ marginTop: '1.5rem' }}>
              {[
                { icon: '💰', title: 'ราคาพิเศษ', desc: 'ลด 20-25% จากราคาปกติ เมื่อสั่ง ≥ 1 kg' },
                { icon: '🔄', title: 'สั่งประจำ', desc: 'ตั้งออเดอร์รายสัปดาห์ แบบ Subscription' },
                { icon: '📊', title: 'Flavor Report', desc: 'ได้รับ Cupping Note และ SCA Score ทุกล็อต' },
                { icon: '🚚', title: 'ส่งฟรี', desc: 'ฟรีค่าส่งเมื่อสั่ง ≥ 20 kg' },
                { icon: '📱', title: 'LINE OA', desc: 'รับแจ้งเตือนเมื่อคั่วเสร็จ พร้อม Tracking' },
              ].map((f) => (
                <div key={f.title} className="feature-row">
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <div className="feature-content">
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="features-right">
            <div className="fr-title">ตาราง B2B Pricing</div>
            <div className="fr-divider" />
            {[
              { num: '1–4 kg', desc: 'ลด 20% · ค่าส่ง ฿250' },
              { num: '5–19 kg', desc: 'ลด 22% · ค่าส่ง ฿150' },
              { num: '20+ kg', desc: 'ลด 25% · ส่งฟรี' },
              { num: 'Subscription', desc: 'ลด 28% · ส่งทุกสัปดาห์ฟรี' },
            ].map((s) => (
              <div key={s.num}>
                <div className="fr-stat">
                  <div className="fr-stat-num">{s.num}</div>
                  <div className="fr-stat-desc">{s.desc}</div>
                </div>
                <div className="fr-divider" />
              </div>
            ))}
            <a href="/th/b2b" className="btn btn-accent" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              สมัคร B2B Partner →
            </a>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Process ── */}
      <section className="section container" id="process">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="t-label" style={{ marginBottom: '0.5rem' }}>Order Flow</p>
          <h2 className="t-h2">ขั้นตอนการสั่งซื้อ</h2>
        </div>
        <div className="process-grid">
          {[
            { n: '01', emoji: '🛒', label: 'เลือกสินค้า', sub: 'เลือก Single Origin ที่ชอบ หรือให้ AI แนะนำ' },
            { n: '02', emoji: '💳', label: 'ชำระเงิน', sub: 'สแกน PromptPay QR ปลอดภัย 100%' },
            { n: '03', emoji: '🔥', label: 'คั่วสดทันที', sub: 'คั่ว Order ใหม่ทุกวัน ไม่มีสต็อกเก่า' },
            { n: '04', emoji: '📦', label: 'Degas & Pack', sub: 'พักแก๊สตามระดับคั่ว ปิดผนึกสุญญากาศ' },
            { n: '05', emoji: '🚚', label: 'Flash Express', sub: 'จัดส่งทั่วไทย 48 ชั่วโมง' },
          ].map((s) => (
            <div key={s.n} className="process-step">
              <div className="step-circle">
                <span className="step-num">{s.emoji}</span>
              </div>
              <div className="step-label">{s.label}</div>
              <div className="step-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section-sm container">
        <div className="cta-banner">
          <h2>เปิดร้านกาแฟ?<br /><em>ราคาพิเศษสำหรับ Partner</em></h2>
          <div className="cta-right">
            <p className="cta-note">ราคา Wholesale · MOQ 1kg · ส่งทุกสัปดาห์</p>
            <a href="/th/b2b" className="btn-light">เข้าสู่พอร์ทัล B2B →</a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer container">
        <div className="footer-top">
          <div>
            <div className="footer-brand">Eight Coffee Roasters</div>
            <p className="footer-tagline">คั่วสดทุกล็อต คัดสรรจากแหล่งผลิตชั้นนำ ส่งตรงถึงมือคุณ</p>
          </div>
          <div>
            <div className="footer-col-title">สินค้า</div>
            <div className="footer-links">
              <a href="/th/products">ทั้งหมด</a>
              <a href="/th/products?roast=Light">Light Roast</a>
              <a href="/th/products?roast=Medium">Medium Roast</a>
              <a href="/th/b2b">Wholesale B2B</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">บริการ</div>
            <div className="footer-links">
              <a href="#selector">ช่วยเลือกเมล็ด</a>
              <a href="/th/orders">ติดตามออเดอร์</a>
              <a href="/liff">LINE LIFF</a>
              <a href="/th/brew">Brew Guide</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">ติดต่อ</div>
            <div className="footer-links">
              <a href="https://line.me/R/ti/p/@eightcoffee">LINE OA</a>
              <a href="mailto:hello@eightcoffee.co.th">อีเมล</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Eight Coffee Roasters · คั่วสด ส่งตรง</span>
          <span className="footer-tech">Powered by Supabase · Vercel · Next.js</span>
        </div>
      </footer>
    </>
  );
}
