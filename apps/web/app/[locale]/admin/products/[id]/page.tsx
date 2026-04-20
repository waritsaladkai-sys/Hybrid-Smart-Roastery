'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProductEditorPage({ params: paramsPromise }: { params: Promise<{ locale: string; id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  const isNew = id === 'new';
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<any>({
    nameTh: '',
    nameEn: '',
    slug: '',
    origin: '',
    process: 'Washed',
    roastLevel: 'Medium',
    badge: '',
    inStock: true,
    descTh: '',
    tagsTh: [],
    flavorScores: { sweet: 3, sour: 3, body: 3, aroma: 3, bitter: 3 },
    variants: [],
    brewGuide: []
  });

  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            setForm({
              nameTh: data.product.name_th || '',
              nameEn: data.product.name_en || '',
              slug: data.product.slug || '',
              origin: data.product.origin || '',
              process: data.product.process || 'Washed',
              roastLevel: data.product.roast_level || 'Medium',
              badge: data.product.badge || '',
              inStock: data.product.in_stock,
              descTh: data.product.desc_th || '',
              tagsTh: data.product.flavor_notes || [],
              flavorScores: { 
                sweet: data.product.flavor_sweet || 3, 
                sour: data.product.flavor_sour || 3, 
                body: data.product.flavor_body || 3, 
                aroma: data.product.flavor_aroma || 3, 
                bitter: data.product.flavor_bitter || 3 
              },
              variants: data.product.product_variants || [],
              brewGuide: data.product.brew_guide || [],
              image_url: data.product.image_url || ''
            });
            setTagsInput((data.product.flavor_notes || []).join(', '));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, tagsTh: tagsInput.split(',').map((s: string) => s.trim()).filter(Boolean) };
      if (isNew) {
        const res = await fetch(`/api/admin/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.product) router.push(`/th/admin/products/${data.product.id}`);
      } else {
        await fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_th: payload.nameTh,
            name_en: payload.nameEn,
            slug: payload.slug,
            origin: payload.origin,
            process: payload.process,
            roast_level: payload.roastLevel,
            badge: payload.badge,
            in_stock: payload.inStock,
            desc_th: payload.descTh,
            flavor_notes: payload.tagsTh,
            flavor_sweet: payload.flavorScores.sweet,
            flavor_sour: payload.flavorScores.sour,
            flavor_body: payload.flavorScores.body,
            flavor_aroma: payload.flavorScores.aroma,
            flavor_bitter: payload.flavorScores.bitter,
          })
        });
        alert('บันทึกสำเร็จ');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isNew) return; // Need ID to upload image
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/products/${id}/image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) setForm({ ...form, image_url: data.imageUrl });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading product...</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-page-title">{isNew ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า: ' + form.nameTh}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={() => router.push('/th/admin/products')}>← กลับ</button>
          <button className="btn btn-dark btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 บันทึก'}</button>
        </div>
      </div>
      
      <div className="admin-content" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cover Image Upload */}
          {!isNew && (
            <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>รูปภาพสินค้า (หน้าปก)</h3>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="Cover" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                ) : (
                  <div style={{ width: 120, height: 120, background: 'var(--bg-muted)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)' }}>No Image</div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ marginBottom: '0.5rem', display: 'block' }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>อัปโหลดภาพสกุล JPG, PNG อัตราส่วน 1:1 หรือ 4:5 เพื่อให้สวยงาม</div>
                </div>
              </div>
            </div>
          )}

          {/* General Info */}
          <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>ข้อมูลทั่วไป</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="t-label">ชื่อสินค้า (TH) *</label>
                <input className="input" value={form.nameTh} onChange={e => setForm({...form, nameTh: e.target.value})} />
              </div>
              <div>
                <label className="t-label">ชื่อสินค้า (EN)</label>
                <input className="input" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} />
              </div>
              <div>
                <label className="t-label">Slug (URL Name) * <span style={{color:'var(--ink-500)'}}>- เช่น ethiopia-yirgacheffe</span></label>
                <input className="input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
              <div>
                <label className="t-label">Origin (แหล่งปลูก) *</label>
                <input className="input" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
              </div>
              <div>
                <label className="t-label">Process *</label>
                <select className="input" value={form.process} onChange={e => setForm({...form, process: e.target.value})}>
                  <option>Washed</option>
                  <option>Natural</option>
                  <option>Honey</option>
                  <option>Anaerobic</option>
                </select>
              </div>
              <div>
                <label className="t-label">ระดับการคั่ว *</label>
                <select className="input" value={form.roastLevel} onChange={e => setForm({...form, roastLevel: e.target.value})}>
                  <option>Light</option>
                  <option>Medium Light</option>
                  <option>Medium</option>
                  <option>Medium Dark</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label className="t-label">ป้ายสัญลักษณ์ (Badge)</label>
                <input className="input" value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="เช่น New Arrival, Best Seller" />
              </div>
              <div>
                <label className="t-label">สถานะของ (In Stock)</label>
                <select className="input" value={form.inStock.toString()} onChange={e => setForm({...form, inStock: e.target.value === 'true'})}>
                  <option value="true">พร้อมขาย</option>
                  <option value="false">ของหมด</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-label">ป้ายรสชาติย่อ (Tags) <span style={{color:'var(--ink-500)'}}>- คั่นด้วยลูกน้ำ (,)</span></label>
                <input className="input" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ดอกไม้, บลูเบอร์รี่, น้ำผึ้ง" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-label">คำอธิบาย</label>
                <textarea className="input" rows={3} value={form.descTh} onChange={e => setForm({...form, descTh: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          {/* Flavor Radar */}
          <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>คะแนนรสชาติสำหรับกราฟ (1-5)</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['sweet', 'sour', 'body', 'aroma', 'bitter'].map((key) => (
                <div key={key} style={{ flex: 1, minWidth: '120px' }}>
                  <label className="t-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  <input type="number" step="0.5" min="1" max="5" className="input" value={form.flavorScores[key]} onChange={e => setForm({ ...form, flavorScores: { ...form.flavorScores, [key]: Number(e.target.value) } })} />
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          {!isNew && (
            <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>ตัวเลือกขนาดและราคา</h3>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const wg = prompt('น้ำหนัก (กรัม):');
                  const rp = prompt('ราคา (บาท):');
                  if (wg && rp) {
                    fetch(`/api/admin/products/${id}/variants`, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ weight_gram: Number(wg), retail_price: Number(rp), sku: `${form.slug}-${wg}g` })
                    }).then(() => window.location.reload());
                  }
                }}>+ เพิ่มขนาด</button>
              </div>
              
              {form.variants.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>น้ำหนัก (g)</th>
                      <th>ราคาขาย (฿)</th>
                      <th>ราคา wholesale (฿)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v: any) => (
                      <tr key={v.id}>
                        <td>{v.weight_gram}g</td>
                        <td>฿{v.retail_price}</td>
                        <td>฿{v.wholesale_price}</td>
                        <td>
                          <button className="btn btn-sm" style={{ color: 'red' }} onClick={() => {
                            if(confirm('ลบขนาดนี้?')) {
                              fetch(`/api/admin/products/${id}/variants?variantId=${v.id}`, { method: 'DELETE' })
                                .then(() => window.location.reload());
                            }
                          }}>ลบ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: 'var(--ink-500)', fontSize: '0.85rem' }}>ยังไม่มีขนาดบรรจุภัณฑ์ หากยังไม่เพิ่ม ลูกค้าจะไม่เห็นสินค้านี้ในร้าน</div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
