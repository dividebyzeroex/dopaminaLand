import HomePageClient from '@/components/HomePageClient';
import { supabase } from '@/lib/supabase';
import localProducts from '@/data/products.json';

// Revalidate every 60 seconds so it updates automatically
export const revalidate = 60;

export default async function HomePage() {
  // Fetch from Supabase
  let { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !products || products.length === 0) {
    console.error('Error fetching products from Supabase, falling back to local JSON', error);
    // Fallback to json if DB is empty or fails
    products = localProducts.map(p => ({
      ...p,
      image_url: p.localImage || p.imageUrl,
    }));
  } else {
    // Map DB fields to what components expect if needed
    products = products.map(p => ({
      ...p,
      localImage: p.image_url,
      shortName: p.short_name,
      salePrice: p.sale_price,
    }));
  }

  return <HomePageClient products={products} />;
}
