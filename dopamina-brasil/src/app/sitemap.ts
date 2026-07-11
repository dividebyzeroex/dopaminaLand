import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import localProducts from '@/data/products.json';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dopaminado.com.br';

  // Static routes
  const routes = [
    '',
    '/minha-conta',
    '/carrinho',
    '/checkout',
    '/ofertas',
    '/ranking',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic product routes
  try {
    let { data: products } = await supabase
      .from('products')
      .select('slug');

    if (!products || products.length === 0) {
      products = localProducts;
    }

    const productRoutes = products.map((p: any) => ({
      url: `${baseUrl}/produto/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...productRoutes];
  } catch (e) {
    const productRoutes = localProducts.map((p: any) => ({
      url: `${baseUrl}/produto/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    return [...routes, ...productRoutes];
  }
}
