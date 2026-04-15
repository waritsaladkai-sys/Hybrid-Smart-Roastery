'use client';
import { useEffect, useRef } from 'react';

const PRODUCTS = [
  {
    emoji: '☕', slug: 'ethiopia-yirgacheffe',
    origin: 'Ethiopia · Yirgacheffe',
    process: 'Natural',
    nameTh: 'เอธิโอเปีย ยิร์กาเชฟเฟ',
    nameEn: 'Ethiopia Yirgacheffe',
    tags: ['ดอกไม้', 'บลูเบอร์รี่', 'น้ำผึ้ง'],
    price: 520, weight: 250, isNew: true,
    roast: 'Light',
  },
  {
    emoji: '☕', slug: 'colombia-huila',
    origin: 'Colombia · Huila',
    process: 'Washed',
    nameTh: 'โคลอมเบีย อูอิลา',
    nameEn: 'Colombia Huila',
    tags: ['ช็อกโกแลต', 'คาราเมล', 'เฮเซลนัต'],
    price: 450, weight: 250, isNew: false,
    roast: 'Medium',
  },
  {
    emoji: '☕', slug: 'thailand-doi-chang',
    origin: 'Thailand · Doi Chang',
    process: 'Honey',
    nameTh: 'ไทย ดอยช้าง ฮันนี่',
    nameEn: 'Thailand Doi Chang',
    tags: ['น้ำผึ้ง', 'พีช', 'อ้อย'],
    price: 380, weight: 250, isNew: false,
    roast: 'Medium Light',
  },
];

const FEATURES = [
  { icon: '🗂️', title: 'Dual Inventory', desc: 'จัดการสารกาแฟ + คั่ว ด้วย FIFO และ Degas Tracker', ready: true },
  { icon: '🔥', title: 'Roast Job Order', desc: 'วางแผนคั่วรายวันจาก Pending Orders อัตโนมัติ', ready: true },
  { icon: '💳', title: 'PromptPay QR', desc: 'สร้าง QR Payment + รับ Webhook จาก GB Prime Pay', ready: true },
  { icon: '🚚', title: 'Flash Express', desc: 'คำนวณค่าส่ง จอง Shipment พร้อมพิมพ์ AWB', ready: true },
  { icon: '🤖', title: 'AI Sommelier', desc: 'ค้นหากาแฟด้วยภาษาธรรมชาติ ผ่าน Gemini AI', ready: true },
  { icon: '📊', title: 'Flavor Visualization', desc: 'Radar Chart (Beginner) + SCA Wheel (Pro)', ready: true },
  { icon: '📱', title: 'LINE LIFF', desc: 'ดูออเดอร์และ Brew Guide ผ่าน LINE OA', ready: false },
  { icon: '🔌', title: 'IoT Integration', desc: 'รองรับ Load Cell และ Sensor ใน Phase 2', ready: false },
];

const MARQUEE_ITEMS = [
  'Single Origin', 'คั่วสดทุกสัปดาห์', 'Flash Express 48h',
  'PromptPay QR', 'LINE Notification', 'AI Sommelier',
  'SCA Flavor Wheel', 'Degas Tracker', 'B2B Wholesale',
];

export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 20);
      }
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
      {/* Scroll progress */}
      <div ref={progressRef} className="scroll-progress" />

      {/* ── Navigation ── */}
      <nav ref={navRef} className="nav">
        <div className="nav-brand">
          <span className="brand-name">Eight Coffee</span>
          <span className="brand-tag">Roasters</span>
        </div>
        <div className="nav-links">
          <a href="#products">สินค้า</a>
          <a href="#features">ระบบ ERP</a>
          <a href="#process">กระบวนการ</a>
          <a href="/th/b2b">ราคาส่ง</a>
        </div>
        <div className="nav-right">
          <span className="locale-btn">TH <span className="locale-sep">/</span> EN</span>
          <a href="/th/products" className="btn btn-dark btn-sm">เลือกซื้อ</a>
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
            คั่วสดทุกล็อต พร้อมระบบ Smart Roastery ERP<br />
            บริหารโรงคั่วและ E-Commerce ในที่เดียว
          </p>

          <div className="hero-cta fade-up delay-3">
            <a href="/th/products" className="btn btn-dark">เลือกซื้อกาแฟ →</a>
            <a href="/th/b2b" className="btn btn-outline">ราคาสำหรับร้านกาแฟ</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <div className="hero-visual-inner">
              <span className="hero-coffee-emoji">☕</span>
            </div>

            {/* Floating badge: Fresh Roasted */}
            <div className="hero-badge-float top-left">
              <div className="hbf-label">Last Roasted</div>
              <div className="hbf-value">Today</div>
              <div className="hbf-sub">Ethiopia Lot #42</div>
            </div>

            {/* Floating badge: Degas */}
            <div className="hero-badge-float bottom-right">
              <div className="hbf-label">Degas Ready In</div>
              <div className="hbf-value">7 days</div>
              <div className="hbf-sub">Light Roast</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        {[
          { num: '15+', lbl: 'Single Origins' },
          { num: '2T', lbl: 'คั่วต่อเดือน' },
          { num: '200+', lbl: 'ร้านกาแฟ Partner' },
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

      {/* ── Products ── */}
      <section className="section container" id="products">
        <div className="products-header">
          <div>
            <p className="t-label" style={{ marginBottom: '0.5rem' }}>Single Origin Collection</p>
            <h2 className="t-h2">กาแฟแนะนำ</h2>
          </div>
          <a href="/th/products" className="btn btn-outline">ดูทั้งหมด →</a>
        </div>

        <div className="products-grid">
          {PRODUCTS.map((p) => (
            <a key={p.slug} href={`/th/products/${p.slug}`} className="product-card">
              <div className="product-img">
                <span className="product-img-emoji">{p.emoji}</span>
                <span className="product-origin-badge">{p.origin}</span>
                {p.isNew && <span className="product-new-badge">New</span>}
              </div>
              <div className="product-body">
                <div className="product-process">{p.process} · {p.roast}</div>
                <h3 className="product-name">{p.nameTh}</h3>
                <div className="product-flavor-tags">
                  {p.tags.map((tag) => (
                    <span key={tag} className="flavor-tag">{tag}</span>
                  ))}
                </div>
                <div className="product-footer-row">
                  <div className="product-price-block">
                    <div className="product-price">฿{p.price}</div>
                    <div className="product-weight">{p.weight}g</div>
                  </div>
                  <span className="btn btn-outline btn-sm">เลือกซื้อ</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── Features ── */}
      <section className="section container" id="features">
        <div className="features-layout">
          <div className="features-left">
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Hybrid Smart Roastery</p>
            <h2 className="t-h2">ระบบ ERP<br />ครบวงจร</h2>
            <p className="t-body" style={{ marginTop: '1rem', maxWidth: '38ch', lineHeight: 1.7 }}>
              ออกแบบมาเพื่อโรงคั่วกาแฟโดยเฉพาะ รวมทุกการทำงานตั้งแต่รับสารกาแฟ ไปจนถึงจัดส่ง
            </p>
            <div className="features-list">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature-row">
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <div className="feature-content">
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                    <div className="feature-status">
                      {f.ready ? (
                        <span className="status-ready-txt">✓ พร้อมใช้งาน</span>
                      ) : (
                        <span className="status-wip-txt">◎ กำลังพัฒนา</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="features-right">
            <div className="fr-title">เทคโนโลยีที่ใช้</div>
            <div className="fr-divider" />
            {[
              { num: 'NestJS', desc: 'Backend API พร้อม Swagger Docs และ Role-Based Access' },
              { num: 'Next.js', desc: 'Frontend App Router + next-intl TH/EN' },
              { num: 'PostgreSQL', desc: 'pgvector สำหรับ AI Semantic Search' },
              { num: 'Gemini AI', desc: 'text-embedding-004 + Gemini Flash 1.5' },
              { num: 'Docker', desc: 'รันบน Raspberry Pi 5, Cloudflare Tunnel' },
            ].map((s) => (
              <div key={s.num}>
                <div className="fr-stat">
                  <div className="fr-stat-num">{s.num}</div>
                  <div className="fr-stat-desc">{s.desc}</div>
                </div>
                <div className="fr-divider" />
              </div>
            ))}
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
            { n: '01', emoji: '🛒', label: 'เลือกสินค้า', sub: 'เลือก Single Origin ที่ชอบ' },
            { n: '02', emoji: '💳', label: 'ชำระเงิน', sub: 'สแกน PromptPay QR' },
            { n: '03', emoji: '🔥', label: 'คั่วสด', sub: 'คั่ว Order ใหม่ทุกวัน' },
            { n: '04', emoji: '📦', label: 'Degas & Pack', sub: 'พักแก๊สตามระดับคั่ว' },
            { n: '05', emoji: '🚚', label: 'จัดส่ง', sub: 'Flash Express 48h' },
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
            <p className="cta-note">ราคา Wholesale · MOQ 5kg · ส่งทุกสัปดาห์</p>
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
              <a href="/th/products?roast=light">Light Roast</a>
              <a href="/th/products?roast=medium">Medium Roast</a>
              <a href="/th/b2b">Wholesale</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">บริการ</div>
            <div className="footer-links">
              <a href="/th/brew">Brew Guide</a>
              <a href="/th/orders">ติดตามออเดอร์</a>
              <a href="/liff">LINE LIFF</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">ระบบ</div>
            <div className="footer-links">
              <a href="/docs">API Docs</a>
              <a href="https://github.com/waritp-lgtm/Hybrid-Smart-Roastery">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Eight Coffee Roasters</span>
          <span className="footer-tech">Built with Next.js · NestJS · Raspberry Pi 5 · Cloudflare</span>
        </div>
      </footer>
    </>
  );
}
