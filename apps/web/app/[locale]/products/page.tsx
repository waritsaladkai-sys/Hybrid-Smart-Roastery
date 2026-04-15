'use client';

import { useState, use } from 'react';
import { PRODUCTS } from '../../../lib/products.data';
import { Navbar } from '../../../components/ui/Navbar';

const ROAST_FILTERS = ['ทั้งหมด', 'Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark'];
const ORIGIN_FILTERS = ['ทั้งหมด', 'Ethiopia', 'Colombia', 'Thailand', 'Kenya', 'Myanmar', 'Brazil'];
const PROCESS_FILTERS = ['ทั้งหมด', 'Natural', 'Washed', 'Honey'];

export default function ProductsPage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
  const params = use(paramsPromise);
  const [roast, setRoast] = useState('ทั้งหมด');
  const [origin, setOrigin] = useState('ทั้งหมด');
  const [process, setProcess] = useState('ทั้งหมด');
  const locale = params?.locale ?? 'th';

  const filtered = PRODUCTS.filter((p) => {
    if (roast !== 'ทั้งหมด' && p.roastLevel !== roast) return false;
    if (origin !== 'ทั้งหมด' && p.origin !== origin) return false;
    if (process !== 'ทั้งหมด' && p.process !== process) return false;
    return true;
  });

  return (
    <>
      <Navbar locale={locale} />
      <main style={{ paddingTop: '5rem' }}>
        <div className="container section-sm">
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="t-label" style={{ marginBottom: '0.5rem' }}>Single Origin Collection</p>
            <h1 className="t-h1">กาแฟทั้งหมด</h1>
            <p className="t-body" style={{ marginTop: '0.75rem' }}>
              {filtered.length} รายการ · คั่วสดทุกสัปดาห์
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="t-label" style={{ minWidth: '60px' }}>คั่ว</span>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {ROAST_FILTERS.map((f) => (
                  <button key={f} className={`filter-chip ${roast === f ? 'active' : ''}`} onClick={() => setRoast(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="t-label" style={{ minWidth: '60px' }}>แหล่งผลิต</span>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {ORIGIN_FILTERS.map((f) => (
                  <button key={f} className={`filter-chip ${origin === f ? 'active' : ''}`} onClick={() => setOrigin(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="t-label" style={{ minWidth: '60px' }}>กระบวนการ</span>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {PROCESS_FILTERS.map((f) => (
                  <button key={f} className={`filter-chip ${process === f ? 'active' : ''}`} onClick={() => setProcess(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="divider" style={{ marginBottom: '2.5rem' }} />

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-500)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</p>
              <p>ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p) => (
                <a key={p.id} href={`/${locale}/products/${p.slug}`} className="product-card" style={{ textDecoration: 'none' }}>
                  <div className="product-img">
                    <span className="product-img-emoji">☕</span>
                    <span className="product-origin-badge">{p.origin}</span>
                    {p.badge && <span className="product-new-badge">{p.badge}</span>}
                  </div>
                  <div className="product-body">
                    <div className="product-process">{p.process} · {p.roastLevelTh}</div>
                    <h2 className="product-name">{p.nameTh}</h2>
                    <div className="product-flavor-tags">
                      {p.tagsTh.map((tag) => (
                        <span key={tag} className="flavor-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="product-footer-row">
                      <div>
                        <div className="product-price">฿{p.variants[0].retailPrice}</div>
                        <div className="product-weight">{p.variants[0].weightGram}g</div>
                      </div>
                      <span className="btn btn-outline btn-sm">ดูรายละเอียด</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="footer container" style={{ marginTop: '4rem' }}>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Eight Coffee Roasters</span>
          <span className="footer-tech">Fresh Roasted · Direct Trade · Flash Express</span>
        </div>
      </footer>
    </>
  );
}
