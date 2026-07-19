import { notFound } from 'next/navigation';
import Link from 'next/link';
import blogData from '@/data/blog-posts.json';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return blogData.posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogData.posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Dopamina Brasil`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogData.posts.find((p) => p.slug === slug);
  if (!post) notFound();

  // Simple markdown-to-HTML (handles ##, ###, **, ~~, -, \n\n)
  const renderContent = (md: string) => {
    return md.split('\n\n').map((block, i) => {
      // Headers
      if (block.startsWith('### ')) {
        return <h3 key={i} className="font-[var(--font-display)] text-lg font-black text-foreground mt-8 mb-3">{block.slice(4)}</h3>;
      }
      if (block.startsWith('## ')) {
        return <h2 key={i} className="font-[var(--font-display)] text-2xl font-black text-foreground mt-10 mb-4">{block.slice(3)}</h2>;
      }
      // Horizontal rule
      if (block.trim() === '---') {
        return <hr key={i} className="border-border my-8" />;
      }
      // Lists
      if (block.includes('\n- ') || block.startsWith('- ')) {
        const items = block.split('\n').filter(l => l.startsWith('- '));
        return (
          <ul key={i} className="space-y-2 my-4 pl-4">
            {items.map((item, j) => (
              <li key={j} className="text-muted text-sm leading-relaxed flex items-start gap-2">
                <span className="text-neon mt-1 shrink-0">▸</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(item.slice(2)) }} />
              </li>
            ))}
          </ul>
        );
      }
      // Numbered lists
      if (/^\d+\./.test(block)) {
        const items = block.split('\n').filter(l => /^\d+\./.test(l));
        return (
          <ol key={i} className="space-y-2 my-4 pl-4">
            {items.map((item, j) => (
              <li key={j} className="text-muted text-sm leading-relaxed flex items-start gap-2">
                <span className="text-neon font-bold mt-0 shrink-0">{j + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s*/, '')) }} />
              </li>
            ))}
          </ol>
        );
      }
      // Italics block
      if (block.startsWith('*') && block.endsWith('*')) {
        return <p key={i} className="text-xs text-muted italic my-4">{block.slice(1, -1)}</p>;
      }
      // Paragraph
      return <p key={i} className="text-muted text-sm leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: formatInline(block) }} />;
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8">
        <Link href="/" className="hover:text-neon transition">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-neon transition">Blog</Link>
        <span>/</span>
        <span className="text-foreground truncate">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-4">
          <time>{new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <span>•</span>
          <span>{post.readTime} de leitura</span>
        </div>
        <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-black text-foreground leading-tight">
          {post.title}
        </h1>
        <p className="mt-3 text-base text-muted">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface border border-border px-3 py-1 text-[10px] font-bold text-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <article className="prose-dark">
        {renderContent(post.content)}
      </article>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-neon/20 bg-surface p-8 text-center">
        <p className="text-foreground font-[var(--font-display)] text-xl font-black">
          Quer sentir a dopamina de comprar sem gastar?
        </p>
        <p className="mt-2 text-sm text-muted">O Dopaminado é o simulador de e-commerce onde tudo é grátis.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-neon px-8 py-3.5 text-sm font-extrabold text-background shadow-lg transition hover:bg-neon-light hover:scale-105 active:scale-95"
        >
          Experimentar agora ⚡
        </Link>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { '@type': 'Organization', name: 'Dopamina Brasil' },
            publisher: {
              '@type': 'Organization',
              name: 'Dopamina Brasil',
              url: 'https://dopaminado.com.br',
            },
          }),
        }}
      />
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\"(.+?)\"/g, '&ldquo;$1&rdquo;');
}
