import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      {/* Disclaimer Banner */}
      <div className="bg-neon/10 border-b border-neon/20 px-4 py-4 text-center">
        <p className="text-sm font-bold text-neon">
          ⚠️ AVISO IMPORTANTE: Este site é uma PIADA. Nenhum produto é real. Nenhuma compra é processada. Nenhum dinheiro é cobrado. É 100% gratuito e 100% fictício. ⚡
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-extrabold text-foreground">dopamina</span>
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              A única loja honesta da internet: você compra tudo e não paga nada.
            </p>
            <p className="mt-2 text-xs text-muted/60">
              100% falso. 200% dopamina. 0% de culpa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Navegação</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="text-sm text-foreground/60 hover:text-neon transition">Catálogo</Link></li>
              <li><Link href="/ranking" className="text-sm text-foreground/60 hover:text-neon transition">Ranking 🏆</Link></li>
              <li><Link href="/carrinho" className="text-sm text-foreground/60 hover:text-neon transition">Carrinho</Link></li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Categorias</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-foreground/60">🎮 Games</span></li>
              <li><span className="text-sm text-foreground/60">📱 Tecnologia</span></li>
              <li><span className="text-sm text-foreground/60">💄 Beleza</span></li>
              <li><span className="text-sm text-foreground/60">👟 Moda</span></li>
              <li><span className="text-sm text-foreground/60">🛋️ Casa</span></li>
            </ul>
          </div>

          {/* Apoie */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Apoie o Projeto</h3>
            <p className="mt-3 text-sm text-foreground/60 leading-relaxed">
              Dopamina é gratuito e sem anúncios. Se curtiu, considere apoiar:
            </p>
            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-pop/20 px-4 py-2 text-sm font-bold text-pop transition hover:bg-pop/30"
            >
              ☕ Buy me a Coffee
            </a>
            <p className="mt-2 text-xs text-muted/50">
              Doadores podem incluir um produto customizado no catálogo!
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted/50">
            © {new Date().getFullYear()} Dopamina Brasil ⚡ — Feito com amor, sarcasmo e zero responsabilidade fiscal.
          </p>
          <p className="mt-1 text-[10px] text-muted/30">
            Nenhum cartão de crédito foi clonado na produção deste site. Nenhum motoboy foi prejudicado. A capivara foi alimentada.
          </p>
        </div>
      </div>
    </footer>
  );
}
