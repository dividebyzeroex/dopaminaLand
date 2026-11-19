import type { MetadataRoute } from "next";
import blogData from "@/data/blog-posts.json";
import { recentProductPaths } from "@/lib/price-store";

const baseUrl = "https://www.dopaminado.com.br";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/black-friday`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/extensao`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...["/legal/termos", "/legal/privacidade", "/legal/lgpd"].map(path => ({ url: `${baseUrl}${path}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];

  // Páginas de produto que já foram consultadas (com histórico gravado).
  const products = (await recentProductPaths().catch(() => [])).map(({ path, day }) => ({
    url: `${baseUrl}/produto/${path}`,
    lastModified: new Date(`${day}T12:00:00Z`),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const posts = blogData.posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...products, ...posts];
}
