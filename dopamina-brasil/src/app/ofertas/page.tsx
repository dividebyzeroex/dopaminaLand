import OfertasClient from '@/components/OfertasClient';
import { supabase } from '@/lib/supabase';
import localProducts from '@/data/products.json';

// Revalidate every 60 seconds so it updates automatically
export const revalidate = 60;

export default async function OfertasPage() {
  // Fetch from Supabase
  // For flash deals, we want items with high discount (> 50%)
  const { data: flashDealsRaw } = await supabase
    .from('products')
    .select('*')
    .gte('discount', 15)
    .order('discount', { ascending: false })
    .limit(3);

  // For today's picks, we want a bunch of highly discounted items
  const { data: picksRaw } = await supabase
    .from('products')
    .select('*')
    .gte('discount', 10)
    .order('created_at', { ascending: false })
    .limit(30);

  // Fallback map if needed (mostly if DB is empty)
  const mapProduct = (p: any) => ({
    ...p,
    localImage: p.image_url,
    shortName: p.short_name,
    salePrice: p.sale_price,
  });

  const flashDeals = (flashDealsRaw || []).map(mapProduct);
  const todayPicks = (picksRaw || []).map(mapProduct);

  return (
    <OfertasClient
      flashDeals={flashDeals}
      todayPicks={todayPicks}
    />
  );
}
