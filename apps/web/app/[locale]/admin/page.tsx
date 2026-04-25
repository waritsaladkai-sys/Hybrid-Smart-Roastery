// Admin Dashboard — mock data until API is wired
const STATS = [
  { label: 'Orders Today', value: '12', sub: '↑ 3 vs yesterday', trend: 'up' },
  { label: 'Revenue (Month)', value: '฿48,250', sub: '↑ 18% vs last month', trend: 'up' },
  { label: 'Green Bean Stock', value: '47.5 kg', sub: '⚠ 3 origins low', trend: 'warn' },
  { label: 'Roasted Stock', value: '18.2 kg', sub: '5 products available', trend: 'up' },
];

const RECENT_ORDERS = [
  { id: 'ORD-001', customer: 'คุณสมชาย', product: 'Ethiopia Yirgacheffe 250g', amount: '฿520', status: 'PAID', date: '15/04/26 10:23' },
  { id: 'ORD-002', customer: 'Coffee & Co.', product: 'Colombia Huila 1kg × 5', amount: '฿8,000', status: 'ROASTING', date: '15/04/26 09:41' },
  { id: 'ORD-003', customer: 'คุณนภา', product: 'Thailand Doi Chang 250g', amount: '฿380', status: 'SHIPPED', date: '14/04/26 16:05' },
  { id: 'ORD-004', customer: 'Brew Lab BKK', product: 'Kenya AA 500g × 2', amount: '฿2,200', status: 'DELIVERED', date: '14/04/26 11:30' },
  { id: 'ORD-005', customer: 'คุณวิชัย', product: 'Brazil Cerrado 500g', amount: '฿660', status: 'PENDING_PAYMENT', date: '15/04/26 11:55' },
];

const STATUS_LABELS: Record<string, { th: string; cls: string }> = {
  PENDING_PAYMENT: { th: 'รอชำระ', cls: 'badge-yellow' },
  PAID: { th: 'ชำระแล้ว', cls: 'badge-blue' },
  ROASTING: { th: 'กำลังคั่ว', cls: 'badge-yellow' },
  READY_TO_SHIP: { th: 'รอจัดส่ง', cls: 'badge-green' },
  SHIPPED: { th: 'จัดส่งแล้ว', cls: 'badge-blue' },
  DELIVERED: { th: 'ส่งถึงแล้ว', cls: 'badge-gray' },
};

const LOW_STOCK = [
  { origin: 'Kenya AA', remaining: '3.5 kg', threshold: '5 kg' },
  { origin: 'Ethiopia Yirgacheffe', remaining: '2.1 kg', threshold: '5 kg' },
  { origin: 'Myanmar Shan', remaining: '1.8 kg', threshold: '3 kg' },
];

const ROAST_PLAN = [
  { origin: 'Ethiopia Yirgacheffe', totalOrderKg: 4.5, roastedKg: 0, status: 'scheduled' },
  { origin: 'Colombia Huila', totalOrderKg: 8.0, roastedKg: 8.0, status: 'done' },
  { origin: 'Kenya AA', totalOrderKg: 2.2, roastedKg: 0, status: 'urgent' },
];

export default function AdminDashboard() {
  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>15 เมษายน 2569</span>
          <a href="/th/admin/b2b" className="btn btn-outline btn-sm">รายชื่อ B2B Partner →</a>
          <a href="/th" className="btn btn-outline btn-sm">← กลับหน้าร้าน</a>
        </div>
      </div>

      <div className="admin-content">

        {/* Stats */}
        <div className="admin-stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="admin-stat-card">
              <div className="asc-label">{s.label}</div>
              <div className="asc-value">{s.value}</div>
              <div className={`asc-badge ${s.trend}`}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Recent Orders */}
          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <span className="admin-table-title">Orders ล่าสุด</span>
              <a href="/th/admin/orders" className="btn btn-outline btn-sm">ดูทั้งหมด →</a>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>ลูกค้า</th>
                  <th>สินค้า</th>
                  <th>ยอด</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => {
                  const s = STATUS_LABELS[o.status] ?? { th: o.status, cls: 'badge-gray' };
                  return (
                    <tr key={o.id}>
                      <td><a href={`/th/admin/orders/${o.id}`} style={{ fontWeight: 500, color: 'var(--accent)' }}>{o.id}</a></td>
                      <td>{o.customer}</td>
                      <td style={{ color: 'var(--ink-500)', fontSize: '0.82rem' }}>{o.product}</td>
                      <td style={{ fontFamily: 'var(--font-serif)' }}>{o.amount}</td>
                      <td><span className={`badge ${s.cls}`}>{s.th}</span></td>
                      <td style={{ color: 'var(--ink-500)', fontSize: '0.82rem' }}>{o.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alerts Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Low Stock */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <span className="admin-table-title">⚠ Low Stock Alert</span>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                {LOW_STOCK.map((item) => (
                  <div key={item.origin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.origin}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>Min: {item.threshold}</div>
                    </div>
                    <span className="badge badge-red">{item.remaining}</span>
                  </div>
                ))}
                <a href="/th/admin/inventory" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  จัดการ Inventory
                </a>
              </div>
            </div>

            {/* Today's Roast Plan */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <span className="admin-table-title">📋 แผนคั่ววันนี้</span>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                {ROAST_PLAN.map((r) => (
                  <div key={r.origin} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.origin}</span>
                      <span className={`badge ${r.status === 'done' ? 'badge-green' : r.status === 'urgent' ? 'badge-red' : 'badge-yellow'}`}>
                        {r.status === 'done' ? 'เสร็จ' : r.status === 'urgent' ? '⚡ ด่วน' : 'กำหนดการ'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ background: r.status === 'done' ? '#22c55e' : 'var(--accent)', height: '100%', width: `${(r.roastedKg / r.totalOrderKg) * 100}%`, borderRadius: '4px', transition: 'width 1s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '0.3rem' }}>
                      {r.roastedKg}/{r.totalOrderKg} kg
                    </div>
                  </div>
                ))}
                <a href="/th/admin/roast" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  จัดการ Roast Jobs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
