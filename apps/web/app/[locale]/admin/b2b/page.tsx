'use client';

import { useState, useEffect } from 'react';

const STATUS_MAP: Record<string, { label: string; cls: string; nextLabel: string | null; nextStatus: string | null }> = {
  NEW:         { label: 'ผู้สนใจใหม่', cls: 'badge-yellow', nextLabel: 'ติดต่อแล้ว', nextStatus: 'CONTACTED' },
  CONTACTED:   { label: 'ติดต่อแล้ว', cls: 'badge-blue', nextLabel: 'เปลี่ยนเป็น Partner', nextStatus: 'CONVERTED' },
  CONVERTED:   { label: 'Partner แล้ว', cls: 'badge-green', nextLabel: null, nextStatus: null },
};

export default function AdminB2BPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/b2b/inquiry');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update status (needs to be implemented in API, but for now we can rely on a patch to a generic or custom route, 
  // wait we only have POST /api/b2b/inquiry for insert. So let's just make it a visual placeholder or skip actual updating
  // since the API route doesn't have PATCH b2b/inquiries yet. Let's write the PATCH there later if needed.)
  
  const selected = inquiries.find((i: any) => i.id === selectedId);

  if (loading) return <div style={{ padding: '2rem' }}>Loading B2B Inquiries...</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">B2B Inquiries (ผู้สนใจราคาส่ง)</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>{inquiries.length} รายการ</span>
          <button className="btn btn-outline btn-sm" onClick={fetchInquiries}>Refresh</button>
        </div>
      </div>
      
      <div className="admin-content">
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ร้าน / ธุรกิจ</th>
                  <th>ผู้ติดต่อ</th>
                  <th>ปริมาณต่อเดือน</th>
                  <th>วันที่</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((i: any) => {
                  const s = STATUS_MAP[i.status] || STATUS_MAP.NEW;
                  return (
                    <tr key={i.id} style={{ cursor: 'pointer', background: selectedId === i.id ? 'var(--bg-muted)' : 'transparent' }} onClick={() => setSelectedId(selectedId === i.id ? null : i.id)}>
                      <td><div style={{ fontWeight: 600 }}>{i.business_name}</div><div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>{i.email || i.phone}</div></td>
                      <td>{i.contact_name}</td>
                      <td>{i.monthly_kg} kg</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
                {inquiries.length === 0 && (
                 <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-500)' }}>ยังไม่มีข้อมูลผู้สนใจ B2B</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>ข้อมูลร้านค้า</h3>
                <button onClick={() => setSelectedId(null)} style={{ cursor: 'pointer', color: 'var(--ink-500)', background: 'none', border: 'none', fontSize: '1.25rem' }}>×</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ชื่อธุรกิจ</span><strong>{selected.business_name}</strong></div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ผู้ติดต่อ</span>{selected.contact_name}</div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>โทรศัพท์</span><a href={`tel:${selected.phone}`}>{selected.phone}</a></div>
                {selected.email && <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>อีเมล</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>}
                {selected.line_id && <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>LINE ID</span>{selected.line_id}</div>}
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ปริมาณที่สั่ง</span><span className="badge badge-yellow">{selected.monthly_kg} kg/เดือน</span></div>
                
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                   <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>เมล็ดที่สนใจ</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                     {selected.products?.map((p: string) => <span key={p} className="badge badge-gray">{p}</span>)}
                   </div>
                </div>

                {selected.note && (
                  <div style={{ marginTop: '0.5rem', background: '#f9f6f2', padding: '0.75rem', borderRadius: '0.5rem' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.2rem' }}>หมายเหตุเพิ่มเติม</div>
                     <div style={{ whiteSpace: 'pre-wrap' }}>{selected.note}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
