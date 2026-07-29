import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-light">

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground font-[var(--font-display)]">dopamina</span>
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Auditoria inteligente de preços para consumidores conscientes.
            </p>
            <div className="mt-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Contato</h3>
              <a href="mailto:contato@dopaminado.com.br" className="mt-1 block text-sm text-foreground/60 hover:text-primary transition">
                contato@dopaminado.com.br
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Navegação</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="text-sm text-foreground/60 hover:text-primary transition">Início</Link></li>
              <li><Link href="/blog" className="text-sm text-foreground/60 hover:text-primary transition">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/legal/privacidade" className="text-sm text-foreground/60 hover:text-primary transition">Privacidade</Link></li>
              <li><Link href="/legal/termos" className="text-sm text-foreground/60 hover:text-primary transition">Termos de Uso</Link></li>
              <li><Link href="/legal/lgpd" className="text-sm text-foreground/60 hover:text-primary transition">LGPD</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Apoie o Projeto</h3>
            <p className="mt-3 text-sm text-foreground/60 leading-relaxed">
              Dopamina é gratuito e sem anúncios. Se curtiu, considere apoiar:
            </p>
            <a
              href="https://buy.stripe.com/00wfZhgEFcAb4Lra3odAk00"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-warm/10 px-4 py-2 text-sm font-medium text-accent-warm transition hover:bg-accent-warm/15"
            >
              ☕ Me pague um café
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Dopamina Brasil — Auditoria de preços inteligente.
          </p>
        </div>
      </div>
    </footer>
  );
}
