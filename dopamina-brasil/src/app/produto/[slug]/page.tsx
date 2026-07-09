import ProductPageClient from './ProductPageClient';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 60; // 60s cache

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch specific product and related products
  const { data: productData, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !productData) return notFound();

  // Map fields
  const product: any = {
    ...productData,
    localImage: productData.image_url,
    shortName: productData.short_name,
    salePrice: productData.sale_price,
  };

  const { data: categoryData } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4);

  const relatedProducts = (categoryData || []).map((p: any) => ({
    ...p,
    localImage: p.image_url,
    shortName: p.short_name,
    salePrice: p.sale_price,
  }));

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
