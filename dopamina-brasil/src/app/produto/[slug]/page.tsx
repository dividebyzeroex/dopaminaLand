import ProductPageClient from './ProductPageClient';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Product } from '@/types';

export const revalidate = 60; // 60s cache

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from('products').select('*').eq('slug', slug).single();
  
  if (!data) return { title: 'Produto Falso não Encontrado' };

  return {
    title: `${data.short_name} | Dopamina Brasil ⚡`,
    description: data.name || `Compre ${data.short_name} por apenas R$ 0,00! É falso, mas a dopamina é real.`,
    openGraph: {
      title: `${data.short_name} | Dopamina Brasil ⚡`,
      description: `Compre ${data.short_name} por R$ 0,00. Satisfação garantida em compras imaginárias!`,
      images: [data.image_url || ''],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.short_name} - Dopamina Brasil`,
      description: `Compre ${data.short_name} por R$ 0,00! A fatura nunca chega.`,
      images: [data.image_url || ''],
    }
  };
}

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
  const product: Product = {
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

  const relatedProducts: Product[] = (categoryData || []).map((p: any) => ({
    ...p,
    localImage: p.image_url,
    shortName: p.short_name,
    salePrice: p.sale_price,
  }));

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
