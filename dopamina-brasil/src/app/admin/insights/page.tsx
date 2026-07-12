import Link from 'next/link';

export default function InsightsMovedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-sm neon-border">
        <span className="text-4xl">🧪</span>
        <h1 className="mt-4 font-[var(--font-display)] text-2xl font-black text-foreground">
          Painel Migrado
        </h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          A aplicação de Insights foi desacoplada com sucesso do e-commerce de simulação e agora roda em uma plataforma dedicada.
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-neon py-3 text-sm font-extrabold text-white transition hover:scale-105 hover:bg-neon-light"
          >
            Acessar Localmente (Porta 3001) 🚀
          </a>
          <Link
            href="/"
            className="rounded-full border border-border py-3 text-sm font-bold text-foreground hover:bg-surface-light transition"
          >
            Voltar para a Loja
          </Link>
        </div>
        
        <div className="mt-6 border-t border-border pt-4 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            Arquitetura h53 Data Intent Suite
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs text-muted/80">
            <li>• <strong>dopamina-brasil</strong>: Coleta telemetry intent.</li>
            <li>• <strong>dopamina-insights</strong>: Visualização & Analytics.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
