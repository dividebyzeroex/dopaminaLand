import Link from 'next/link';
import blogData from '@/data/blog-posts.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Dopamina Brasil | Neurociência do Consumo',
  description: 'Artigos sobre dopamina, psicologia do consumo e como hackear seu cérebro para comprar menos e viver melhor.',
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neon mb-4">
          📖 Neurociência do Consumo
        </span>
        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-black text-foreground">
          Blog <span className="gradient-text">Dopamina</span>
        </h1>
        <p className="mt-3 text-base text-muted max-w-lg mx-auto">
          Artigos sobre como seu cérebro funciona quando você compra coisas — e como hackear isso.
        </p>
      </div>

      <div className="space-y-6">
        {blogData.posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col sm:flex-row gap-6 rounded-2xl border border-border bg-card p-6 transition hover:border-neon/30 hover:shadow-lg hover:shadow-neon/5"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface text-4xl sm:h-24 sm:w-24">
              {post.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <time>{new Date(post.date).toLocaleDateString('pt-BR')}</time>
                <span>•</span>
                <span>{post.readTime} de leitura</span>
              </div>
              <h2 className="font-[var(--font-display)] text-xl font-black text-foreground group-hover:text-neon transition line-clamp-2">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface border border-border px-2.5 py-1 text-[10px] font-bold text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
