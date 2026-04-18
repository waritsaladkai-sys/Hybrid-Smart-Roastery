// @ts-nocheck
'use client';

import { useState } from 'react';

const ROAST_JOBS = [
  { id: 'RJ-001', origin: 'Ethiopia Yirgacheffe', greenLot: 'LOT-2025-042', targetKg: 4.5, roastedKg: 0, yieldPct: null, roastLevel: 'Light', startTemp: 200, dropTemp: 195, roastTimeSec: 720, status: 'scheduled', createdFor: 'ORD-001, ORD-006', scheduledDate: '2025-04-16', operator: 'คุณมานะ' },
  { id: 'RJ-002', origin: 'Colombia Huila', greenLot: 'LOT-2025-039', targetKg: 8.0, roastedKg: 8.0, yieldPct: 84.5, roastLevel: 'Medium', startTemp: 200, dropTemp: 205, roastTimeSec: 840, status: 'completed', createdFor: 'ORD-002', scheduledDate: '2025-04-15', operator: 'คุณมานะ' },
  { id: 'RJ-003', origin: 'Kenya AA', greenLot: 'LOT-2025-044', targetKg: 2.2, roastedKg: 0, yieldPct: null, roastLevel: 'Light', startTemp: 200, dropTemp: null, roastTimeSec: null, status: 'urgent', createdFor: 'ORD-004', scheduledDate: '2025-04-16', operator: '-' },
  { id: 'RJ-004', origin: 'Brazil Cerrado', greenLot: 'LOT-2025-038', targetKg: 3.0, roastedKg: 0, yieldPct: null, roastLevel: 'Medium Dark', startTemp: 200, dropTemp: null, roastTimeSec: null, status: 'scheduled', createdFor: 'ORD-005', scheduledDate: '2025-04-17', operator: '-' },
];

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'กำหนดการ', cls: 'badge-yellow' },
  in_progress: { label: '🔥 กำลังคั่ว', cls: 'badge-red' },
  completed: { label: '✓ เสร็จสิ้น', cls: 'badge-green' },
  urgent: { label: '⚡ ด่วน', cls: 'badge-red' },
};

export default function AdminRoastPage() {
  const [jobs, setJobs] = useState(ROAST_JOBS);
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const startRoast = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'in_progress' } : j));
    setActiveJob(id);
  };

  const completeRoast = (id: string, roastedKg: number) => {
    setJobs(prev => prev.map((j) => {
      if (j.id !== id) return j;
      const yieldPct = +(roastedKg / j.targetKg * 100).toFixed(1);
      return { ...j, status: 'completed', roastedKg, yieldPct };
    }));
    setActiveJob(null);
  };

  const totalScheduledKg = jobs.filter(j => j.status !== 'completed').reduce((s, j) => s + j.targetKg, 0);
  const completedToday = jobs.filter(j => j.status === 'completed' && j.scheduledDate === '2025-04-15').length;
  const avgYield = jobs.filter(j => j.yieldPct).reduce((s, j) => s + (j.yieldPct ?? 0), 0) / jobs.filter(j => j.yieldPct).length;

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">Roast Jobs</h1>
        <button className="btn btn-dark btn-sm" onClick={() => setShowForm(true)} id="new-roast-job-btn">
          + สร้าง Roast Job
        </button>
      </div>
      <div className="admin-content">

        {/* Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="asc-label">งานคั่วทั้งหมด</div>
            <div className="asc-value">{jobs.length}</div>
            <div className="asc-sub">{jobs.filter(j => j.status === 'scheduled' || j.status === 'urgent').length} รอดำเนินการ</div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-label">เป้าหมายรวม (kg)</div>
            <div className="asc-value">{totalScheduledKg.toFixed(1)}</div>
            <div className="asc-sub">Pending roast batch</div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-label">เสร็จวันนี้</div>
            <div className="asc-value">{completedToday}</div>
            <div className="asc-sub">Ready to degas</div>
          </div>
          <div className="admin-stat-card">
            <div className="asc-label">Avg Yield</div>
            <div className="asc-value">{isNaN(avgYield) ? '-' : `${avgYield.toFixed(1)}%`}</div>
            <div className="asc-sub">สารดิบ → คั่วแล้ว</div>
          </div>
        </div>

        {/* Active roast alert */}
        {activeJob && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--r-md)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#9a3412' }}>🔥 กำลังคั่วอยู่: {jobs.find(j => j.id === activeJob)?.origin}</div>
              <div style={{ fontSize: '0.85rem', color: '#c2410c', marginTop: '0.25rem' }}>
                เป้าหมาย {jobs.find(j => j.id === activeJob)?.targetKg} kg · {jobs.find(j => j.id === activeJob)?.roastLevel}
              </div>
            </div>
            <button className="btn btn-dark btn-sm" onClick={() => completeRoast(activeJob, +(jobs.find(j => j.id === activeJob)!.targetKg * 0.845).toFixed(2))}>
              ✓ บันทึกผลการคั่ว
            </button>
          </div>
        )}

        {/* Roast Jobs Table */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Roast Job Queue</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>แหล่งผลิต</th>
                <th>Green Lot</th>
                <th>ระดับคั่ว</th>
                <th>เป้า (kg)</th>
                <th>คั่วได้ (kg)</th>
                <th>Yield %</th>
                <th>วันที่</th>
                <th>Order</th>
                <th>สถานะ</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const s = STATUS_LABELS[job.status];
                return (
                  <tr key={job.id}>
                    <td><code style={{ fontSize: '0.8rem' }}>{job.id}</code></td>
                    <td style={{ fontWeight: 500 }}>{job.origin}</td>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>{job.greenLot}</code></td>
                    <td>{job.roastLevel}</td>
                    <td>{job.targetKg}</td>
                    <td style={{ fontWeight: job.roastedKg > 0 ? 600 : undefined, color: job.roastedKg > 0 ? 'var(--ink-900)' : 'var(--ink-500)' }}>
                      {job.roastedKg > 0 ? job.roastedKg : '—'}
                    </td>
                    <td>
                      {job.yieldPct ? (
                        <span style={{ color: job.yieldPct >= 82 ? '#22c55e' : job.yieldPct >= 78 ? 'var(--accent)' : '#ef4444', fontWeight: 600 }}>
                          {job.yieldPct}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--ink-500)', fontSize: '0.82rem' }}>{job.scheduledDate}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>{job.createdFor}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      {(job.status === 'scheduled' || job.status === 'urgent') && !activeJob && (
                        <button className="btn btn-accent btn-sm" onClick={() => startRoast(job.id)} style={{ fontSize: '0.75rem' }}>
                          🔥 เริ่มคั่ว
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FIFO note */}
        <div style={{ marginTop: '1.5rem', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--ink-500)' }}>
          <strong style={{ color: 'var(--ink-700)' }}>หลักการ FIFO:</strong> ระบบจัดลำดับการใช้สารกาแฟจาก Lot ที่รับเข้าก่อนสุด (First In, First Out)
          เพื่อความสดของสารกาแฟและลดการสูญเสีย · Yield ปกติ: <strong>80–87%</strong> ขึ้นกับระดับการคั่ว
        </div>

        {/* New Job Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowForm(false)}>
            <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', padding: '2rem', maxWidth: '480px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>สร้าง Roast Job ใหม่</h3>
              {['แหล่งผลิต / Lot', 'ระดับคั่ว', 'น้ำหนักเป้าหมาย (kg)', 'วันที่คั่ว', 'ออเดอร์ที่เกี่ยวข้อง'].map(label => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink-500)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                  <input style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', font: 'inherit', fontSize: '0.9rem' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>ยกเลิก</button>
                <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => setShowForm(false)}>สร้าง Job</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
