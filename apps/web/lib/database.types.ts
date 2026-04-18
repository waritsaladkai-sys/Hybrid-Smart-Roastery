// ════════════════════════════════════════════════════════════
// Supabase Database Types — Auto-generated from schema
// Regenerate: npx supabase gen types typescript --project-id eatlvoysvkfzooksbya > lib/database.types.ts
// ════════════════════════════════════════════════════════════

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
          line_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name_th: string;
          name_en: string;
          origin: string;
          farm: string | null;
          altitude: string | null;
          process: 'Natural' | 'Washed' | 'Honey' | 'Anaerobic' | 'Wet Hulled';
          variety: string | null;
          roast_level: 'Light' | 'Medium Light' | 'Medium' | 'Medium Dark' | 'Dark';
          degas_days: number;
          flavor_notes: string[];
          desc_th: string | null;
          desc_en: string | null;
          flavor_sweet: number;
          flavor_sour: number;
          flavor_body: number;
          flavor_aroma: number;
          flavor_bitter: number;
          embedding: string | null;
          is_active: boolean;
          badge: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          weight_gram: number;
          retail_price: number;
          wholesale_price: number;
          sku: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          ship_full_name: string;
          ship_phone: string;
          ship_address: string;
          ship_district: string;
          ship_province: string;
          ship_postcode: string;
          subtotal: number;
          shipping_fee: number;
          total: number;
          status: 'PENDING_PAYMENT' | 'PAID' | 'ROASTING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
          tracking_number: string | null;
          flash_order_id: string | null;
          note: string | null;
          is_b2b: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name_th: string;
          weight_gram: number;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          amount: number;
          status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
          qr_code_url: string | null;
          reference_no: string | null;
          gbpay_token: string | null;
          paid_at: string | null;
          raw_webhook: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      inventory_green: {
        Row: {
          id: string;
          lot_number: string;
          origin: string;
          process: string;
          purchased_kg: number;
          remaining_kg: number;
          alert_threshold_kg: number;
          cost_per_kg: number;
          supplier: string | null;
          arrived_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_green']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory_green']['Insert']>;
      };
      inventory_roasted: {
        Row: {
          id: string;
          batch_id: string;
          product_id: string | null;
          green_lot_id: string | null;
          roast_level: string;
          roasted_kg: number;
          remaining_kg: number;
          yield_pct: number | null;
          roasted_at: string;
          degas_ready_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_roasted']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['inventory_roasted']['Insert']>;
      };
      roast_jobs: {
        Row: {
          id: string;
          green_lot_id: string | null;
          product_id: string | null;
          target_kg: number;
          roasted_kg: number | null;
          yield_pct: number | null;
          roast_level: string;
          start_temp: number | null;
          drop_temp: number | null;
          roast_time_sec: number | null;
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          operator_name: string | null;
          order_refs: string[] | null;
          scheduled_date: string;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['roast_jobs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['roast_jobs']['Insert']>;
      };
      system_config: {
        Row: { key: string; value: string; description: string | null; updated_at: string };
        Insert: Omit<Database['public']['Tables']['system_config']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['system_config']['Insert']>;
      };
      iot_sensor_log: {
        Row: {
          id: string; device_id: string; sensor_type: string;
          value: number; unit: string; recorded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['iot_sensor_log']['Row'], 'id' | 'recorded_at'>;
        Update: never;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
      order_status: 'PENDING_PAYMENT' | 'PAID' | 'ROASTING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    };
  };
};

// ── Convenience Row types ──────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type InventoryGreen = Database['public']['Tables']['inventory_green']['Row'];
export type RoastJob = Database['public']['Tables']['roast_jobs']['Row'];

// ── Extended types with joins ─────────────────────────────────
export type ProductWithVariants = Product & { product_variants: ProductVariant[] };
export type OrderWithItems = Order & { order_items: (OrderItem & { products: Pick<Product, 'name_th' | 'slug'> })[] };
