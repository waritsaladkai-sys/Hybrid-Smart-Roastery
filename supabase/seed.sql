-- ════════════════════════════════════════════════════════════
-- Eight Coffee Roasters — Seed Data
-- Run AFTER schema.sql
-- ════════════════════════════════════════════════════════════

-- ── System Config ────────────────────────────────────────────
INSERT INTO system_config (key, value, description) VALUES
  ('SHIPPING_PROVIDER',             'flash_express',         'Logistics provider'),
  ('FREE_SHIPPING_THRESHOLD_THB',   '500',                   'Free shipping threshold (THB)'),
  ('DEFAULT_SHIPPING_FEE_THB',      '50',                    'Flat shipping fee'),
  ('LOW_STOCK_ALERT_KG',            '5',                     'Alert when green bean below this kg'),
  ('PAYMENT_PROVIDER',              'mock',                  'mock | gbprimepay'),
  ('STORE_NAME_TH',                 'Eight Coffee Roasters', 'Store display name'),
  ('STORE_LINE_OA',                 '@eightcoffee',          'LINE OA handle'),
  ('DEGAS_DEFAULT_DAYS',            '7',                     'Default degas days after roasting'),
  ('B2B_MIN_ORDER_KG',              '1',                     'Minimum order for B2B pricing (kg)')
ON CONFLICT (key) DO NOTHING;

-- ── Products ─────────────────────────────────────────────────
INSERT INTO products (
  slug, name_th, name_en, origin, farm, altitude, process, variety,
  roast_level, degas_days, flavor_notes, desc_th,
  flavor_sweet, flavor_sour, flavor_body, flavor_aroma, flavor_bitter,
  is_active, badge, sort_order
) VALUES

(
  'ethiopia-yirgacheffe-natural',
  'เอธิโอเปีย ยิร์กาเชฟเฟ เนเชอรัล',
  'Ethiopia Yirgacheffe Natural',
  'Ethiopia', 'Kochere Washing Station', '1,800–2,200m',
  'Natural', 'Heirloom', 'Light', 10,
  ARRAY['ดอกไม้', 'บลูเบอร์รี่', 'น้ำผึ้ง', 'ไวน์'],
  'กลิ่นหอมดอกไม้ชัดเจน มีความหวานของบลูเบอร์รี่และน้ำผึ้ง เปรี้ยวสดชื่นแบบผลไม้เขตร้อน',
  4.0, 3.5, 2.0, 5.0, 1.0, TRUE, 'New Arrival', 1
),
(
  'colombia-huila-washed',
  'โคลอมเบีย อูอิลา วอช',
  'Colombia Huila Washed',
  'Colombia', 'Finca La Esperanza', '1,600–1,900m',
  'Washed', 'Castillo', 'Medium', 7,
  ARRAY['ช็อกโกแลต', 'คาราเมล', 'เฮเซลนัต'],
  'บอดี้หนักแน่น หวานแบบคาราเมล มีกลิ่นช็อกโกแลตดาร์ก สมดุลดี',
  4.0, 2.0, 4.5, 3.5, 2.5, TRUE, 'Bestseller', 2
),
(
  'thailand-doi-chang-honey',
  'ไทย ดอยช้าง ฮันนี่',
  'Thailand Doi Chang Honey',
  'Thailand', 'Doi Chang Village', '1,200–1,600m',
  'Honey', 'Typica / Catimor', 'Medium Light', 7,
  ARRAY['น้ำผึ้ง', 'พีช', 'อ้อย'],
  'หวานแบบน้ำผึ้ง ความเปรี้ยวต่ำ บอดี้กลางๆ ดื่มง่ายสำหรับทุกคน',
  4.5, 1.5, 3.0, 3.5, 1.5, TRUE, NULL, 3
),
(
  'kenya-aa-washed',
  'เคนยา AA วอช',
  'Kenya AA Washed',
  'Kenya', 'Nyeri Cooperative', '1,700–2,100m',
  'Washed', 'SL28 / SL34', 'Light', 12,
  ARRAY['แบล็กเคอร์แรนท์', 'มะนาว', 'ดอกไม้'],
  'เปรี้ยวสดสไตล์ผลไม้แดง กลิ่นแบล็กเคอร์แรนท์ชัดเจน ซับซ้อนและมีบุคลิก',
  3.0, 5.0, 2.5, 4.5, 1.0, TRUE, 'Limited', 4
),
(
  'myanmar-shan-natural',
  'เมียนมา ฉาน เนเชอรัล',
  'Myanmar Shan Natural',
  'Myanmar', 'Shan Highlands Farm', '1,400–1,800m',
  'Natural', 'Bourbon / Typica', 'Medium', 8,
  ARRAY['มะม่วง', 'มะพร้าว', 'ช็อกโกแลต'],
  'กลิ่นหอมมะม่วงและมะพร้าวที่เป็นเอกลักษณ์ของพื้นที่สูงรัฐฉาน',
  4.0, 2.5, 3.5, 4.0, 2.0, TRUE, NULL, 5
),
(
  'brazil-cerrado-natural',
  'บราซิล เซอร์ราโด เนเชอรัล',
  'Brazil Cerrado Natural',
  'Brazil', 'Fazenda Santa Lucia', '900–1,100m',
  'Natural', 'Yellow Bourbon', 'Medium Dark', 5,
  ARRAY['ช็อกโกแลต', 'ถั่ว', 'คาราเมล'],
  'บอดี้หนัก ขมนุ่ม เหมาะเป็น Base สำหรับ Espresso และ Latte',
  3.5, 1.0, 5.0, 3.0, 3.5, TRUE, NULL, 6
);

-- ── Product Variants ──────────────────────────────────────────
-- Ethiopia Yirgacheffe Natural
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 100,  220, 180 FROM products WHERE slug = 'ethiopia-yirgacheffe-natural';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  520, 420 FROM products WHERE slug = 'ethiopia-yirgacheffe-natural';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  980, 800 FROM products WHERE slug = 'ethiopia-yirgacheffe-natural';

-- Colombia Huila Washed
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  450, 360 FROM products WHERE slug = 'colombia-huila-washed';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  850, 680 FROM products WHERE slug = 'colombia-huila-washed';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 1000, 1600, 1280 FROM products WHERE slug = 'colombia-huila-washed';

-- Thailand Doi Chang Honey
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 200,  310, 250 FROM products WHERE slug = 'thailand-doi-chang-honey';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  380, 300 FROM products WHERE slug = 'thailand-doi-chang-honey';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  720, 580 FROM products WHERE slug = 'thailand-doi-chang-honey';

-- Kenya AA
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  580, 460 FROM products WHERE slug = 'kenya-aa-washed';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  1100, 880 FROM products WHERE slug = 'kenya-aa-washed';

-- Myanmar Shan
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  420, 340 FROM products WHERE slug = 'myanmar-shan-natural';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  800, 640 FROM products WHERE slug = 'myanmar-shan-natural';

-- Brazil Cerrado
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 250,  350, 280 FROM products WHERE slug = 'brazil-cerrado-natural';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 500,  660, 530 FROM products WHERE slug = 'brazil-cerrado-natural';
INSERT INTO product_variants (product_id, weight_gram, retail_price, wholesale_price)
SELECT id, 1000, 1240, 990 FROM products WHERE slug = 'brazil-cerrado-natural';

-- ── Green Bean Inventory ─────────────────────────────────────
INSERT INTO inventory_green (
  lot_number, origin, process, purchased_kg, remaining_kg,
  alert_threshold_kg, cost_per_kg, supplier, arrived_at
) VALUES
  ('LOT-2025-042', 'Ethiopia Yirgacheffe', 'Natural',  20, 12.8, 5, 620, 'Kochere Farm',          '2025-03-10'),
  ('LOT-2025-039', 'Colombia Huila',       'Washed',   30, 18.5, 5, 480, 'Finca La Esperanza',    '2025-02-28'),
  ('LOT-2025-041', 'Thailand Doi Chang',   'Honey',    25, 14.2, 5, 350, 'Doi Chang Village',     '2025-03-05'),
  ('LOT-2025-044', 'Kenya AA',             'Washed',   10,  3.5, 5, 780, 'Nyeri Cooperative',     '2025-03-20'),
  ('LOT-2025-040', 'Myanmar Shan',         'Natural',  15,  1.8, 3, 420, 'Shan Highlands',        '2025-03-01'),
  ('LOT-2025-038', 'Brazil Cerrado',       'Natural',  50, 28.3, 10, 280, 'Fazenda Santa Lucia',  '2025-02-15');

-- ── Admin User (create via Supabase Auth Dashboard first, then update role) ──
-- After creating admin@eightcoffee.co.th via Supabase Auth > Users > Invite user:
-- UPDATE profiles SET role = 'ADMIN' WHERE email = 'admin@eightcoffee.co.th';
-- UPDATE profiles SET role = 'STAFF' WHERE email = 'roaster@eightcoffee.co.th';
