'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStatus = async (id: string, field: 'is_active' | 'in_stock', currentVal: boolean) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentVal })
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading products...</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">ระบบจัดการสินค้า (Products CMS)</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>{products.length} รายการ</span>
          <button className="btn btn-outline btn-sm" onClick={fetchProducts}>Refresh</button>
          <button className="btn btn-dark btn-sm" onClick={() => router.push('/th/admin/products/new')}>+ เพิ่มสินค้าใหม่</button>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อสินค้า</th>
                <th>สายพันธุ์ / แหล่ง</th>
                <th>คั่ว / โปรเซส</th>
                <th>สถานะขาย (Active)</th>
                <th>มีสินค้า (In Stock)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name_th} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, background: 'var(--bg-muted)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>☕</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name_th}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>{p.variants?.length || 0} ตัวเลือกขนาด</div>
                  </td>
                  <td>
                    <div>{p.origin}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{p.variety || '-'}</div>
                  </td>
                  <td>
                    <span className="badge badge-yellow">{p.roast_level}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: 4 }}>{p.process}</div>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(p.id, 'is_active', p.is_active)}
                      className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`} 
                      style={{ cursor: 'pointer', border: 'none' }}>
                      {p.is_active ? 'แสดงหน้าร้าน' : 'ซ่อน'}
                    </button>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(p.id, 'in_stock', p.in_stock)}
                      className={`badge ${p.in_stock ? 'badge-blue' : 'badge-red'}`} 
                      style={{ cursor: 'pointer', border: 'none' }}>
                      {p.in_stock ? 'พร้อมขาย' : 'ของหมด'}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/th/admin/products/${p.id}`)}>
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>ยังไม่มีสินค้า แนะนำให้เพิ่มสินค้าใหม่ หรือรันวงจร Seed</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
