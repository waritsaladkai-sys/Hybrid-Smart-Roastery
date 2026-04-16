'use client';

import { useState, useEffect } from 'react';

// Mock order data for LIFF demo
// Production: fetch from /api/v1/orders?lineUserId={liff.profile.userId}
const MOCK_ORDERS = [
  {
    id: 'ORD-003', status: 'SHIPPED', date: '14/04/69',
    items: 'Thailand Doi Chang Honey 250g × 1',
    total: 430, tracking: 'FX1234567890TH',
  },
  {
    id: 'ORD-001', status: 'DELIVERED', date: '07/04/69',
    items: 'Ethiopia Yirgacheffe 250g × 1',
    total: 570, tracking: 'FX9876543210TH',
  },
];

const BREW_GUIDES = [
  {
    method: 'Pour Over (V60)', icon: '☕',
    steps: [
      'บดกาแฟ Medium Fine — 15g',
      'น้ำ 90°C — 225ml (สัดส่วน 1:15)',
      'เทน้ำ Bloom 30ml รอ 30 วิ',
      'เทน้ำเป็นวงกลมสม่ำเสมอ 3:00–3:30 นาที',
    ],
    tip: 'เหมาะกับ Light-Medium Roast เช่น Ethiopia, Kenya',
  },
  {
    method: 'AeroPress', icon: '🫙',
    steps: [
      'บดกาแฟ Medium Fine — 18g',
      'น้ำ 85°C — 200ml',
      'ใส่กาแฟ เทน้ำ คนเร็ว 10 วิ',
      'กด plunger ช้าๆ 1:30 นาที',
    ],
    tip: 'Versatile — ลองด้วย inverted method',
  },
  {
    method: 'Moka Pot', icon: '🍳',
    steps: [
      'บดกาแฟ Medium Fine — 18g (เต็ม basket)',
      'ใส่น้ำร้อนถึงเส้น safety valve',
      'ตั้งไฟกลาง-อ่อน ปิดฝา',
      'เสร็จเมื่อได้ยินเสียงฟู่',
    ],
    tip: 'เหมาะกับ Medium-Dark เช่น Brazil, Colombia',
  },
  {
    method: 'Cold Brew', icon: '🧊',
    steps: [
      'บดกาแฟ Coarse — 80g',
      'น้ำเย็น 1000ml (1:12.5)',
      'แช่ตู้เย็น 12–16 ชั่วโมง',
      'กรองผ่าน paper filter',
    ],
    tip: 'เก็บได้ 2 สัปดาห์ในตู้เย็น',
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  PENDING_PAYMENT: { label: 'รอชำระ', color: '#f59e0b', emoji: '💳' },
  PAID:            { label: 'ชำระแล้ว', color: '#3b82f6', emoji: '✅' },
  ROASTING:        { label: 'กำลังคั่ว', color: '#ef4444', emoji: '🔥' },
  READY_TO_SHIP:   { label: 'รอจัดส่ง', color: '#22c55e', emoji: '📦' },
  SHIPPED:         { label: 'จัดส่งแล้ว', color: '#8b5cf6', emoji: '🚚' },
  DELIVERED:       { label: 'ส่งถึงแล้ว', color: '#6b7280', emoji: '🎉' },
};

type Tab = 'orders' | 'brew' | 'sommelier';

export default function LiffPage() {
  const [tab, setTab] = useState<Tab>('orders');
  const [liffReady, setLiffReady] = useState(false);
  const [profile, setProfile] = useState<{ displayName: string; pictureUrl: string } | null>(null);
  const [sommelierQuery, setSommelierQuery] = useState('');
  const [sommelierResult, setSommelierResult] = useState('');
  const [sommelierLoading, setSommelierLoading] = useState(false);

  // Initialize LIFF SDK
  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          // Dev mode: use mock profile
          setProfile({ displayName: 'Dev User ☕', pictureUrl: '' });
          setLiffReady(true);
          return;
        }
        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) { liff.login(); return; }
        const p = await liff.getProfile();
        setProfile({ displayName: p.displayName, pictureUrl: p.pictureUrl });
        setLiffReady(true);
      } catch {
        // Fallback for non-LINE browser
        setProfile({ displayName: 'Eight Coffee Member', pictureUrl: '' });
        setLiffReady(true);
      }
    };
    initLiff();
  }, []);

  const askSommelier = async () => {
    if (!sommelierQuery.trim()) return;
    setSommelierLoading(true);
    setSommelierResult('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${API}/api/v1/sommelier/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sommelierQuery }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setSommelierResult(data.recommendation ?? 'ไม่พบคำแนะนำ ลองถามใหม่')
    } catch {
      // Dev mock
      setSommelierResult(`จากที่คุณบอกว่า "${sommelierQuery}" ขอแนะนำ:\n\n☕ Ethiopia Yirgacheffe Natural — มีกลิ่นดอกไม้และบลูเบอร์รี่ที่ชัดเจน เปรี้ยวสดชื่น\n\n☕ Kenya AA Washed — ซับซ้อน เปรี้ยวแบบผลไม้แดง เหมาะสำหรับคนที่ชอบกาแฟมีบุคลิก`);
    }
    setSommelierLoading(false);
  };

  if (!liffReady) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f5f2', fontFamily: 'Sarabun, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>☕</div>
          <p style={{ color: '#6b6560' }}>กำลังโหลด LINE LIFF...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100svh', background: '#f7f5f2', fontFamily: "'Sarabun', sans-serif", maxWidth: '430px', margin: '0 auto', position: 'relative', paddingBottom: '5rem' }}>

      {/* Header */}
      <div style={{ background: '#1c1814', padding: '1.25rem 1.25rem 1rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {profile?.pictureUrl ? (
            <img src={profile.pictureUrl} alt={profile.displayName} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #c17f4a' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#c17f4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>☕</div>
          )}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>EIGHT COFFEE ROASTERS</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>สวัสดี, {profile?.displayName}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: '#fff', borderBottom: '1px solid #eee9e3', position: 'sticky', top: 0, zIndex: 10 }}>
        {([['orders','📦','ออเดอร์'],['brew','☕','Brew Guide'],['sommelier','🤖','AI Sommelier']] as const).map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '0.85rem 0.5rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', borderBottom: tab === key ? '2px solid #c17f4a' : '2px solid transparent', color: tab === key ? '#c17f4a' : '#6b6560', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: tab === key ? 600 : 400, transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.25rem' }}>

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>ออเดอร์ของคุณ</h2>
            {MOCK_ORDERS.map(o => {
              const s = STATUS_MAP[o.status];
              return (
                <div key={o.id} style={{ background: '#fff', border: '1px solid #eee9e3', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#c17f4a' }}>{o.id}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b6560', marginTop: '0.1rem' }}>{o.date}</div>
                    </div>
                    <span style={{ background: `${s.color}20`, color: s.color, padding: '0.2rem 0.65rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {s.emoji} {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#3a3530', marginBottom: '0.75rem' }}>{o.items}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #eee9e3' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b6560' }}>฿{o.total.toLocaleString()}</span>
                    {o.tracking && (
                      <a href={`https://www.flashexpress.co.th/tracking?id=${o.tracking}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🚚 {o.tracking}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <a href="/th/orders" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1.5px solid #eee9e3', borderRadius: '10px', color: '#6b6560', fontSize: '0.85rem', marginTop: '0.5rem', textDecoration: 'none' }}>
              ดูออเดอร์ทั้งหมด →
            </a>
          </div>
        )}

        {/* ── Brew Guide ── */}
        {tab === 'brew' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Brew Guide</h2>
            {BREW_GUIDES.map(g => (
              <details key={g.method} style={{ background: '#fff', border: '1px solid #eee9e3', borderRadius: '12px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                <summary style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '0.95rem', listStyle: 'none' }}>
                  <span style={{ fontSize: '1.5rem' }}>{g.icon}</span>
                  {g.method}
                </summary>
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #eee9e3' }}>
                  <ol style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {g.steps.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.875rem', color: '#3a3530', lineHeight: 1.6 }}>{s}</li>
                    ))}
                  </ol>
                  <div style={{ marginTop: '0.75rem', background: '#f5ebe0', border: '1px solid rgba(193,127,74,0.2)', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#8a5832' }}>
                    💡 {g.tip}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}

        {/* ── AI Sommelier ── */}
        {tab === 'sommelier' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>AI Sommelier</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b6560', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              บอกฉันว่าคุณอยากได้กาแฟแบบไหน แล้วฉันจะแนะนำ Single Origin ที่เหมาะกับคุณ
            </p>

            {/* Example chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {['กาแฟหวาน ไม่เปรี้ยว', 'ชอบกลิ่นดอกไม้', 'อยากลองกาแฟไทย', 'เปรี้ยวสดชื่น'].map(q => (
                <button key={q} onClick={() => setSommelierQuery(q)} style={{ padding: '0.4rem 0.8rem', borderRadius: '100px', border: '1px solid #eee9e3', background: '#fff', fontSize: '0.78rem', cursor: 'pointer', color: '#3a3530', fontFamily: 'inherit' }}>
                  {q}
                </button>
              ))}
            </div>

            <textarea
              value={sommelierQuery}
              onChange={e => setSommelierQuery(e.target.value)}
              placeholder="เช่น 'อยากได้กาแฟหวานๆ เหมาะทำ Latte' หรือ 'ชอบรสเปรี้ยวผลไม้'"
              rows={3}
              style={{ width: '100%', padding: '0.85rem', border: '1.5px solid #eee9e3', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'none', outline: 'none', background: '#fff', lineHeight: 1.6 }}
              id="sommelier-input"
            />

            <button
              onClick={askSommelier}
              disabled={sommelierLoading || !sommelierQuery.trim()}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.9rem', background: sommelierLoading ? '#9b6448' : '#1c1814', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: sommelierLoading ? 'wait' : 'pointer', transition: 'background 0.2s' }}
              id="sommelier-submit"
            >
              {sommelierLoading ? '🤖 กำลังคิด...' : '🤖 ขอคำแนะนำ'}
            </button>

            {sommelierResult && (
              <div style={{ marginTop: '1.25rem', background: '#fff', border: '1px solid #eee9e3', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c17f4a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  🤖 AI Sommelier แนะนำ
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#3a3530', whiteSpace: 'pre-line' }}>{sommelierResult}</p>
                <a href="/th/products" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.6rem 1.25rem', background: '#1c1814', color: '#fff', borderRadius: '100px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                  ดูสินค้าทั้งหมด →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav hint */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#fff', borderTop: '1px solid #eee9e3', padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: '#b0aaa4', textAlign: 'center' }}>
        Eight Coffee Roasters · LIFF v2 · Powered by Gemini AI
      </div>
    </div>
  );
}
