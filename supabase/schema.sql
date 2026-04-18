-- ════════════════════════════════════════════════════════════
-- Eight Coffee Roasters — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ── Enum Types ───────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
CREATE TYPE order_status AS ENUM (
  'PENDING_PAYMENT', 'PAID', 'ROASTING',
  'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'
);
CREATE TYPE roast_level AS ENUM ('Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark');
CREATE TYPE process_type AS ENUM ('Natural', 'Washed', 'Honey', 'Anaerobic', 'Wet Hulled');
CREATE TYPE roast_job_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- ── Profiles (extends Supabase auth.users) ──────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'CUSTOMER',
  line_user_id TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  name_th         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  origin          TEXT NOT NULL,
  farm            TEXT,
  altitude        TEXT,
  process         process_type NOT NULL,
  variety         TEXT,
  roast_level     roast_level NOT NULL,
  degas_days      INT NOT NULL DEFAULT 7,
  flavor_notes    TEXT[] DEFAULT '{}',
  desc_th         TEXT,
  desc_en         TEXT,
  -- Flavor scores (1-5)
  flavor_sweet    DECIMAL(3,1) DEFAULT 3.0,
  flavor_sour     DECIMAL(3,1) DEFAULT 3.0,
  flavor_body     DECIMAL(3,1) DEFAULT 3.0,
  flavor_aroma    DECIMAL(3,1) DEFAULT 3.0,
  flavor_bitter   DECIMAL(3,1) DEFAULT 3.0,
  -- AI vector embedding (for Sommelier search)
  embedding       vector(768),
  is_active       BOOLEAN DEFAULT TRUE,
  badge           TEXT,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Product Variants (weight + price) ───────────────────────
CREATE TABLE product_variants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight_gram       INT NOT NULL,
  retail_price      DECIMAL(10,2) NOT NULL,
  wholesale_price   DECIMAL(10,2) NOT NULL,
  sku               TEXT UNIQUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, weight_gram)
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Shipping address (snapshot at order time)
  ship_full_name  TEXT NOT NULL,
  ship_phone      TEXT NOT NULL,
  ship_address    TEXT NOT NULL,
  ship_district   TEXT NOT NULL,
  ship_province   TEXT NOT NULL,
  ship_postcode   TEXT NOT NULL,
  -- Financials
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee    DECIMAL(10,2) NOT NULL DEFAULT 50,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Status machine
  status          order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  -- Flash Express
  tracking_number TEXT,
  flash_order_id  TEXT,
  -- Metadata
  note            TEXT,
  is_b2b          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Order Items ──────────────────────────────────────────────
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  variant_id        UUID NOT NULL REFERENCES product_variants(id),
  product_name_th   TEXT NOT NULL,
  weight_gram       INT NOT NULL,
  unit_price        DECIMAL(10,2) NOT NULL,
  quantity          INT NOT NULL DEFAULT 1,
  subtotal          DECIMAL(10,2) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL DEFAULT 'gbprimepay',
  amount          DECIMAL(10,2) NOT NULL,
  status          payment_status NOT NULL DEFAULT 'PENDING',
  qr_code_url     TEXT,
  reference_no    TEXT,
  gbpay_token     TEXT,
  paid_at         TIMESTAMPTZ,
  raw_webhook     JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Green Bean Inventory ─────────────────────────────────────
CREATE TABLE inventory_green (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_number        TEXT UNIQUE NOT NULL,
  origin            TEXT NOT NULL,
  process           process_type NOT NULL,
  purchased_kg      DECIMAL(8,2) NOT NULL,
  remaining_kg      DECIMAL(8,2) NOT NULL,
  alert_threshold_kg DECIMAL(8,2) NOT NULL DEFAULT 5.0,
  cost_per_kg       DECIMAL(8,2) NOT NULL,
  supplier          TEXT,
  arrived_at        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Roasted Bean Inventory ───────────────────────────────────
CREATE TABLE inventory_roasted (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id        TEXT UNIQUE NOT NULL,
  product_id      UUID REFERENCES products(id),
  green_lot_id    UUID REFERENCES inventory_green(id),
  roast_level     roast_level NOT NULL,
  roasted_kg      DECIMAL(8,2) NOT NULL,
  remaining_kg    DECIMAL(8,2) NOT NULL,
  yield_pct       DECIMAL(5,2),
  roasted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  degas_ready_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Roast Jobs ───────────────────────────────────────────────
CREATE TABLE roast_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  green_lot_id    UUID REFERENCES inventory_green(id),
  product_id      UUID REFERENCES products(id),
  target_kg       DECIMAL(8,2) NOT NULL,
  roasted_kg      DECIMAL(8,2),
  yield_pct       DECIMAL(5,2),
  roast_level     roast_level NOT NULL,
  start_temp      INT,
  drop_temp       INT,
  roast_time_sec  INT,
  status          roast_job_status DEFAULT 'SCHEDULED',
  operator_name   TEXT,
  order_refs      TEXT[],
  scheduled_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── System Config ────────────────────────────────────────────
CREATE TABLE system_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── IoT Sensor Log (Future: Load Cell) ──────────────────────
CREATE TABLE iot_sensor_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id   TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value       DECIMAL(10,4) NOT NULL,
  unit        TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_iot_device_time ON iot_sensor_log(device_id, recorded_at DESC);

-- ════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ════════════════════════════════════════════════════════════

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_green   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_roasted ENABLE ROW LEVEL SECURITY;
ALTER TABLE roast_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_sensor_log    ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ── Profiles policies ────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));

-- ── Products: Public read, admin write ──────────────────────
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Admin can manage products"
  ON products FOR ALL USING (get_user_role() = 'ADMIN');

CREATE POLICY "Variants are publicly readable"
  ON product_variants FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Admin can manage variants"
  ON product_variants FOR ALL USING (get_user_role() = 'ADMIN');

-- ── Orders: Users see own, staff see all ────────────────────
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Staff can read all orders"
  ON orders FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "Staff can update order status"
  ON orders FOR UPDATE USING (get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );
CREATE POLICY "Staff can read all order items"
  ON order_items FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "System can insert order items"
  ON order_items FOR INSERT WITH CHECK (TRUE);

-- ── Payments: private ────────────────────────────────────────
CREATE POLICY "Users can see own payments"
  ON payments FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );
CREATE POLICY "Staff can see all payments"
  ON payments FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "System can insert payments"
  ON payments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "System can update payments"
  ON payments FOR UPDATE USING (TRUE);

-- ── Inventory: staff only ────────────────────────────────────
CREATE POLICY "Staff can read inventory"
  ON inventory_green FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "Admin can manage inventory"
  ON inventory_green FOR ALL USING (get_user_role() = 'ADMIN');

CREATE POLICY "Staff can read roasted inventory"
  ON inventory_roasted FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "Admin can manage roasted inventory"
  ON inventory_roasted FOR ALL USING (get_user_role() = 'ADMIN');

CREATE POLICY "Staff can read roast jobs"
  ON roast_jobs FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));
CREATE POLICY "Staff can manage roast jobs"
  ON roast_jobs FOR ALL USING (get_user_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Admin can manage system config"
  ON system_config FOR ALL USING (get_user_role() = 'ADMIN');

CREATE POLICY "Staff can insert IoT logs"
  ON iot_sensor_log FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Staff can read IoT logs"
  ON iot_sensor_log FOR SELECT USING (get_user_role() IN ('ADMIN', 'STAFF'));

-- ════════════════════════════════════════════════════════════
-- Triggers
-- ════════════════════════════════════════════════════════════

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON inventory_green
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
