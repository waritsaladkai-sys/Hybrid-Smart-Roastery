// @ts-nocheck
'use client';

import { useState } from 'react';

const ORDERS = [
  { id: 'ORD-001', customer: 'คุณสมชาย วงศ์ดี', phone: '081-234-5678', items: 'Ethiopia Yirgacheffe 250g × 1', amount: 520, status: 'PAID', date: '2025-04-15 10:23', address: 'กรุงเทพ', trackingNo: null, flash: null },
  { id: 'ORD-002', customer: 'Coffee & Co. BKK', phone: '02-555-8888', items: 'Colombia Huila 1kg × 5', amount: 8000, status: 'ROASTING', date: '2025-04-15 09:41', address: 'กรุงเทพ', trackingNo: null, flash: null },
  { id: 'ORD-003', customer: 'คุณนภา มีสุข', phone: '089-876-5432', items: 'Thailand Doi Chang 250g × 1', amount: 380, status: 'SHIPPED', date: '2025-04-14 16:05', address: 'เชียงใหม่', trackingNo: 'TH12345678901', flash: 'FX1234567890TH' },
  { id: 'ORD-004', customer: 'Brew Lab BKK', phone: '095-111-2222', items: 'Kenya AA 500g × 2', amount: 2200, status: 'DELIVERED', date: '2025-04-14 11:30', address: 'กรุงเทพ', trackingNo: 'TH98765432101', flash: 'FX9876543210TH' },
  { id: 'ORD-005', customer: 'คุณวิชัย แสงทอง', phone: '083-999-7777', items: 'Brazil Cerrado 500g × 1', amount: 660, status: 'PENDING_PAYMENT', date: '2025-04-15 11:55', address: 'ขอนแก่น', trackingNo: null, flash: null },
  { id: 'ORD-006', customer: 'คุณลลิดา นุชนาถ', phone: '062-444-3333', items: 'Myanmar Shan 250g × 2', amount: 840, status: 'PAID', date: '2025-04-15 08:12', address: 'ภูเก็ต', trackingNo: null, flash: null },
];

const STATUS_MAP: Record<string, { label: string; cls: string; nextLabel: string | null; nextStatus: string | null }> = {
  PENDING_PAYMENT: { label: 'รอชำระ', cls: 'badge-yellow', nextLabel: null, nextStatus: null },
  PAID:            { label: 'ชำระแล้ว', cls: 'badge-blue', nextLabel: 'เริ่มคั่ว', nextStatus: 'ROASTING' },
  ROASTING:        { label: 'กำลังคั่ว', cls: 'badge-yellow', nextLabel: 'พร้อมส่ง', nextStatus: 'READY_TO_SHIP' },
  READY_TO_SHIP:   { label: 'รอจัดส่ง', cls: 'badge-green', nextLabel: 'จองขนส่ง', nextStatus: 'SHIPPED' },
  SHIPPED:         { label: 'จัดส่งแล้ว', cls: 'badge-blue', nextLabel: null, nextStatus: null },
  DELIVERED:       { label: 'ส่งถึงแล้ว', cls: 'badge-gray', nextLabel: null, nextStatus: null },
};

const STATUS_FILTERS = ['ทั้งหมด', 'PENDING_PAYMENT', 'PAID', 'ROASTING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
const STATUS_FILTER_LABELS: Record<string, string> = {
  'ทั้งหมด': 'ทั้งหมด', 'PENDING_PAYMENT': 'รอชำระ', 'PAID': 'ชำระแล้ว',
  'ROASTING': 'กำลังคั่ว', 'READY_TO_SHIP': 'รอส่ง', 'SHIPPED': 'จัดส่ง', 'DELIVERED': 'ส่งถึงแล้ว',
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('ทั้งหมด');
  const [orders, setOrders] = useState(ORDERS);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filter === 'ทั้งหมด' ? orders : orders.filter(o => o.status === filter);
  const selectedOrder = orders.find(o => o.id === selected);

  const updateStatus = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, trackingNo: newStatus === 'SHIPPED' ? 'TH' + Date.now().toString().slice(-11) : o.trackingNo } : o));
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">Orders Management</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>{orders.length} orders total</span>
          <button className="btn btn-outline btn-sm">Export CSV</button>
        </div>
      </div>
      <div className="admin-content">

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: 'รอชำระ', val: orders.filter(o => o.status === 'PENDING_PAYMENT').length, cls: 'badge-yellow' },
            { label: 'ชำระแล้ว (รอคั่ว)', val: orders.filter(o => o.status === 'PAID').length, cls: 'badge-blue' },
            { label: 'กำลังคั่ว', val: orders.filter(o => o.status === 'ROASTING').length, cls: 'badge-yellow' },
            { label: 'จัดส่งแล้ว', val: orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED').length, cls: 'badge-green' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card">
              <div className="asc-label">{s.label}</div>
              <div className="asc-value">{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {STATUS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
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
                  const s = STATUS_MAP[o.status];
                  return (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected === o.id ? null : o.id)}>
                      <td><span style={{ fontWeight: 500, color: 'var(--accent)' }}>{o.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.customer}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>{o.phone}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>{o.items}</td>
                      <td style={{ fontFamily: 'var(--font-serif)' }}>฿{o.amount.toLocaleString()}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>{o.date}</td>
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
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedOrder && (
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>{selectedOrder.id}</h3>
                <button onClick={() => setSelected(null)} style={{ cursor: 'pointer', color: 'var(--ink-500)', background: 'none', border: 'none', fontSize: '1.25rem' }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ลูกค้า</span><strong>{selectedOrder.customer}</strong></div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>โทร</span>{selectedOrder.phone}</div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>จังหวัด</span>{selectedOrder.address}</div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>สินค้า</span>{selectedOrder.items}</div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>ยอด</span><span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>฿{selectedOrder.amount.toLocaleString()}</span></div>
                <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>สถานะ</span><span className={`badge ${STATUS_MAP[selectedOrder.status].cls}`}>{STATUS_MAP[selectedOrder.status].label}</span></div>
                {selectedOrder.trackingNo && (
                  <div><span style={{ color: 'var(--ink-500)', width: '100px', display: 'inline-block' }}>Tracking</span><code style={{ fontSize: '0.85rem' }}>{selectedOrder.flash}</code></div>
                )}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {STATUS_MAP[selectedOrder.status].nextStatus && (
                  <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }} onClick={() => updateStatus(selectedOrder.id, STATUS_MAP[selectedOrder.status].nextStatus!)}>
                    {STATUS_MAP[selectedOrder.status].nextLabel} →
                  </button>
                )}
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  🖨️ พิมพ์ใบเสร็จ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
