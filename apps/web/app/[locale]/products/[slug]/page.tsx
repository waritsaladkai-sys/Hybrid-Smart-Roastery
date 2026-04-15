'use client';

import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../../lib/products.data';
import { Navbar } from '../../../../components/ui/Navbar';
import { FlavorRadar } from '../../../../components/flavor/FlavorRadar';
import { useCart } from '../../../../contexts/cart.context';


const ROAST_COLORS: Record<string, string> = {
  'Light': '#F5C27A',
  'Medium Light': '#D4985A',
  'Medium': '#B87040',
  'Medium Dark': '#8B4A20',
  'Dark': '#4A2010',
};

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ locale: string; slug: string }> }) {
  const params = use(paramsPromise);
  const locale = params?.locale ?? 'th';
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const variant = product.variants[selectedVariantIdx];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${variant.weightGram}`,
      slug: product.slug,
      nameTh: product.nameTh,
      origin: product.origin,
      process: product.process,
      roastLevel: product.roastLevel,
      weightGram: variant.weightGram,
      price: variant.retailPrice,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar locale={locale} />
      <main style={{ paddingTop: '5rem' }}>
        <div className="container section">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--ink-500)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a href={`/${locale}`} style={{ color: 'var(--ink-500)' }}>หน้าแรก</a>
            <span>/</span>
            <a href={`/${locale}/products`} style={{ color: 'var(--ink-500)' }}>สินค้า</a>
            <span>/</span>
            <span style={{ color: 'var(--ink-900)' }}>{product.nameTh}</span>
          </nav>

          <div className="product-detail-grid">
            {/* Visual */}
            <div className="product-detail-visual">☕</div>

            {/* Info */}
            <div className="product-detail-body">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="pd-process">{product.origin} · {product.process}</span>
                {product.badge && (
                  <span className="badge badge-green">{product.badge}</span>
                )}
              </div>
              <h1 className="pd-name">{product.nameTh}</h1>
              <p className="pd-desc">{product.descTh}</p>

              {/* Roast + Origin metadata */}
              <div className="pd-meta-grid">
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Roast Level</div>
                  <div className="pd-meta-value" style={{ color: ROAST_COLORS[product.roastLevel] }}>
                    {product.roastLevelTh}
                  </div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Process</div>
                  <div className="pd-meta-value">{product.process}</div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Variety</div>
                  <div className="pd-meta-value">{product.variety}</div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Farm / Station</div>
                  <div className="pd-meta-value" style={{ fontSize: '0.85rem' }}>{product.farm}</div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Altitude</div>
                  <div className="pd-meta-value" style={{ fontSize: '0.85rem' }}>{product.altitude}</div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-label">Degas Ready</div>
                  <div className="pd-meta-value">{product.degasDays} วัน</div>
                </div>
              </div>

              {/* Flavor tags */}
              <div className="pd-flavor-section">
                <div className="pd-flavor-title">Flavor Notes</div>
                <div className="pd-flavor-tags">
                  {product.tagsTh.map((tag) => (
                    <span key={tag} className="flavor-tag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Flavor Radar */}
              <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '2rem' }}>
                <div className="pd-flavor-title" style={{ marginBottom: '0', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  Flavor Profile
                </div>
                <FlavorRadar scores={product.flavorScores} />
              </div>

              {/* Degas info */}
              <div className="pd-degas">
                <span className="pd-degas-icon">⏱️</span>
                <div className="pd-degas-text">
                  <strong>Degassing:</strong> กาแฟคั่วใหม่ต้องพักแก๊ส {product.degasDays} วันหลังคั่ว ก่อนรสชาติจะถึงจุดที่ดีที่สุด
                  <br />
                  เราจัดส่งหลังพักแก๊สครบถ้วนเสมอ
                </div>
              </div>

              {/* Weight selector */}
              <div className="pd-flavor-title">เลือกขนาด</div>
              <div className="pd-weight-select">
                {product.variants.map((v, i) => (
                  <button
                    key={v.weightGram}
                    className={`weight-option ${i === selectedVariantIdx ? 'selected' : ''}`}
                    onClick={() => setSelectedVariantIdx(i)}
                    aria-label={`${v.weightGram}g`}
                  >
                    <div style={{ fontWeight: 600 }}>{v.weightGram}g</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.2rem' }}>฿{v.retailPrice}</div>
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="pd-price-row">
                <span className="pd-price">฿{variant.retailPrice}</span>
                <span className="pd-price-per">/ {variant.weightGram}g</span>
              </div>

              {/* Qty + Add to Cart */}
              <div className="pd-cta">
                <div className="qty-ctrl" role="group" aria-label="Quantity">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(qty + 1)} aria-label="Increase">+</button>
                </div>
                <button
                  className={`btn ${added ? 'btn-outline' : 'btn-dark'}`}
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  id="add-to-cart-btn"
                  disabled={added}
                >
                  {added ? '✓ เพิ่มแล้ว!' : '🛒 เพิ่มในตะกร้า'}
                </button>
              </div>

              {/* Brew Guide */}
              {product.brewGuide.length > 0 && (
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                  <div className="pd-flavor-title" style={{ marginBottom: '1rem' }}>วิธีชงที่แนะนำ</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {product.brewGuide.map((g) => (
                      <div key={g.method} style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{g.method}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                          {[
                            { label: 'Ratio', val: g.ratio },
                            { label: 'Temp', val: g.temp },
                            { label: 'Grind', val: g.grind },
                            { label: 'Time', val: g.time },
                          ].map((item) => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--ink-500)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{item.label}</div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
