import Link from 'next/link';
import CleitonEasterEgg from './CleitonEasterEgg';

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
              href="https://buy.stripe.com/00wfZhgEFcAb4Lra3odAk00"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-pop/20 px-4 py-2 text-sm font-bold text-pop transition hover:bg-pop/30"
            >
              ☕ Me pague um café
            </a>
            <p className="mt-2 text-xs text-muted/50">
              Doadores podem incluir um produto customizado no catálogo!
            </p>
          </div>
        </div>

        {/* SEO Semântico: O que é Dopamina? */}
        <div className="mt-12 border-t border-border pt-8 text-left max-w-4xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Estudo de Caso & SEO Semântico</h4>
          <h3 className="text-lg font-black text-foreground mt-2">O que é a Dopamina e como ela afeta as compras por impulso? 🧠⚡</h3>
          <p className="text-xs text-muted leading-relaxed mt-2">
            A <strong>dopamina</strong> é um neurotransmissor liberado pelo cérebro que atua diretamente no nosso sistema de recompensa e motivação. Ao contrário do que muitos pensam, a dopamina não é liberada no momento em que você recebe ou consome o produto, mas sim durante a <strong>antecipação</strong> e o desejo da recompensa.
          </p>
          <p className="text-xs text-muted leading-relaxed mt-2">
            Quando você entra em um e-commerce, pesquisa por produtos de desejo, preenche cupons e finaliza uma compra, seu cérebro recebe descargas rápidas de <strong>dopamina</strong>. O projeto <strong>Dopamina Brasil</strong> (dopaminado.com.br) serve como uma paródia e um laboratório UX para explorar esses gatilhos mentais do consumismo sem as faturas de cobrança, demonstrando que o estímulo da dopamina e a sensação de alívio podem ser gerados e saciados de forma 100% fictícia e gratuita.
          </p>
        </div>

        <CleitonEasterEgg />

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
