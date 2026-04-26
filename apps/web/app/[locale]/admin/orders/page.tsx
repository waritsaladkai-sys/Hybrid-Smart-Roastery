// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

const STATUS_MAP: Record<string, { label: string; cls: string; nextLabel: string | null; nextStatus: string | null }> = {
  PENDING:         { label: 'รอชำระ', cls: 'badge-yellow', nextLabel: null, nextStatus: null },
  PENDING_REVIEW:  { label: 'ตรวจสอบสลิป', cls: 'badge-yellow', nextLabel: 'ยืนยันยอด', nextStatus: 'PAID' },
  PAID:            { label: 'ชำระแล้ว', cls: 'badge-blue', nextLabel: 'เริ่มคั่ว', nextStatus: 'ROASTING' },
  ROASTING:        { label: 'กำลังคั่ว', cls: 'badge-yellow', nextLabel: 'พร้อมส่ง', nextStatus: 'READY_TO_SHIP' },
  READY_TO_SHIP:   { label: 'รอจัดส่ง', cls: 'badge-green', nextLabel: 'ส่งแล้ว', nextStatus: 'SHIPPED' },
  SHIPPED:         { label: 'จัดส่งแล้ว', cls: 'badge-blue', nextLabel: null, nextStatus: null },
  DELIVERED:       { label: 'ส่งถึงแล้ว', cls: 'badge-gray', nextLabel: null, nextStatus: null },
};

const STATUS_FILTERS = ['ทั้งหมด', 'PENDING', 'PENDING_REVIEW', 'PAID', 'ROASTING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
const STATUS_FILTER_LABELS: Record<string, string> = {
  'ทั้งหมด': 'ทั้งหมด', 'PENDING': 'รอชำระ', 'PENDING_REVIEW': 'ตรวจสลิป', 'PAID': 'ชำระแล้ว',
  'ROASTING': 'กำลังคั่ว', 'READY_TO_SHIP': 'รอส่ง', 'SHIPPED': 'จัดส่ง', 'DELIVERED': 'ส่งถึงแล้ว',
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('ทั้งหมด');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = async () => {
    try {
      // Use admin-specific endpoint so we see ALL orders (including guest orders)
      const url = filter === 'ทั้งหมด'
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = filter === 'ทั้งหมด' ? orders : orders.filter(o => o.status === filter);
  const selectedOrder = orders.find(o => o.id === selectedId);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const isConfirmingPayment = newStatus === 'PAID' && selectedOrder?.status === 'PENDING_REVIEW';
      const body: any = { status: newStatus };
      if (isConfirmingPayment) body.confirmed_payment = true;

      // if moving to SHIPPED, ask for tracking
      if (newStatus === 'SHIPPED') {
        if (!trackingInput) {
          alert('กรุณากรอก Tracking Number ก่อนอัปเดตเป็น จัดส่งแล้ว');
          return;
        }
        body.tracking_number = trackingInput;
      }

      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      setTrackingInput('');
      fetchOrders();
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading orders...</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">Orders Management</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>{orders.length} orders total</span>
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>Refresh</button>
        </div>
      </div>
      <div className="admin-content">

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: 'รอตรวจยืนยันสลิป', val: orders.filter(o => o.status === 'PENDING_REVIEW').length, cls: 'badge-yellow' },
            { label: 'ชำระแล้ว (รอคั่ว)', val: orders.filter(o => o.status === 'PAID').length, cls: 'badge-blue' },
            { label: 'กำลังคั่ว', val: orders.filter(o => o.status === 'ROASTING').length, cls: 'badge-yellow' },
            { label: 'รอจัดส่ง', val: orders.filter(o => o.status === 'READY_TO_SHIP').length, cls: 'badge-green' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card">
              <div className="asc-label">{s.label}</div>
              <div className="asc-value" style={{ color: s.val > 0 ? 'var(--accent)' : 'inherit' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="filter-bar" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {STATUS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Table */}
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>ลูกค้า</th>
                  <th>สินค้า</th>
                  <th>ยอด</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const s = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={o.id} style={{ cursor: 'pointer', background: selectedId === o.id ? 'var(--bg-muted)' : 'transparent' }} onClick={() => setSelectedId(selectedId === o.id ? null : o.id)}>
                      <td><span style={{ fontWeight: 500, color: 'var(--accent)', fontSize: '0.8rem' }}>{o.id.split('-')[0]}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.recipient_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>{o.phone}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>{o.order_items?.length || 0} รายการ</td>
                      <td style={{ fontFamily: 'var(--font-serif)' }}>฿{o.total?.toLocaleString()}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()}>
                        {s.nextStatus && (
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => updateStatus(o.id, s.nextStatus!)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {s.nextLabel} →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                 <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-500)' }}>ไม่มีคำสั่งซื้อในสถานะนี้</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedOrder && (
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{selectedOrder.id}</h3>
                <button onClick={() => setSelectedId(null)} style={{ cursor: 'pointer', color: 'var(--ink-500)', background: 'none', border: 'none', fontSize: '1.25rem' }}>×</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ลูกค้า</span><strong>{selectedOrder.recipient_name}</strong></div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>โทร</span>{selectedOrder.phone}</div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ที่อยู่</span>{selectedOrder.address_line} {selectedOrder.district} {selectedOrder.province} {selectedOrder.postal_code}</div>
                
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                   <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>รายการสินค้า</div>
                   {selectedOrder.order_items?.map((i: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                         <div>{i.product_name_th} × {i.quantity}</div>
                         <div>฿{i.subtotal}</div>
                      </div>
                   ))}
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                   <span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ยอดรวม</span>
                   <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>฿{selectedOrder.total?.toLocaleString()}</span>
                </div>
                
                <div>
                   <span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>สถานะ</span>
                   <span className={`badge ${(STATUS_MAP[selectedOrder.status]||STATUS_MAP.PENDING).cls}`}>{(STATUS_MAP[selectedOrder.status]||STATUS_MAP.PENDING).label}</span>
                </div>
                
                {selectedOrder.tracking_number && (
                  <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>Tracking</span><code style={{ fontSize: '0.85rem' }}>{selectedOrder.tracking_number}</code></div>
                )}
              </div>

              {/* Status Update / Action Area */}
              <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.status === 'READY_TO_SHIP' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Tracking Number (Flash Express)</label>
                    <input 
                      type="text" 
                      value={trackingInput} 
                      onChange={e => setTrackingInput(e.target.value)}
                      placeholder="TH1234567890" 
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} 
                    />
                  </div>
                )}

                {(STATUS_MAP[selectedOrder.status]||STATUS_MAP.PENDING).nextStatus && (
                  <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }} onClick={() => updateStatus(selectedOrder.id, STATUS_MAP[selectedOrder.status].nextStatus!)}>
                    {(STATUS_MAP[selectedOrder.status]||STATUS_MAP.PENDING).nextLabel} →
                  </button>
                )}
              </div>

              {/* Slip Action - we fetch slip_url from payments table, since API GET orders includes payments(*) we can check it */}
              {selectedOrder.payments?.[0]?.slip_url && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.5rem' }}>หลักฐานการโอนเงิน</div>
                  <a href={selectedOrder.payments[0].slip_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedOrder.payments[0].slip_url} alt="Slip" style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                  </a>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}

