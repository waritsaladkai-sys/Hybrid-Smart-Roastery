import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase';
import { PRODUCTS } from '../../../../lib/products.data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = createAdminClient();

  let totalInserted = 0;

  for (const p of PRODUCTS) {
    // Insert product
    const { data: product, error: productErr } = await admin.from('products').insert({
      slug: p.slug,
      name_th: p.nameTh,
      name_en: p.nameEn,
      origin: p.origin,
      farm: p.farm,
      altitude: p.altitude,
      process: p.process,
      variety: p.variety,
      roast_level: p.roastLevel,
      degas_days: p.degasDays,
      flavor_notes: p.tagsTh,
      desc_th: p.descTh,
      desc_en: p.descEn,
      flavor_sweet: p.flavorScores.sweet,
      flavor_sour: p.flavorScores.sour,
      flavor_body: p.flavorScores.body,
      flavor_aroma: p.flavorScores.aroma,
      flavor_bitter: p.flavorScores.bitter,
      is_active: p.inStock, // use inStock for active for now
      badge: p.badge,
      brew_guide: p.brewGuide as any,
      in_stock: p.inStock
    }).select().single();

    if (productErr) {
      console.error('Error inserting product', p.slug, productErr);
      continue;
    }

    // Insert variants
    if (p.variants && p.variants.length > 0) {
      const variantData = p.variants.map((v: any) => ({
        product_id: product.id,
        weight_gram: v.weightGram,
        retail_price: v.retailPrice,
        wholesale_price: v.wholesalePrice,
        sku: `${p.slug}-${v.weightGram}g`
      }));
      await admin.from('product_variants').insert(variantData);
    }
    
    totalInserted++;
  }

  return NextResponse.json({ success: true, totalInserted });
}
