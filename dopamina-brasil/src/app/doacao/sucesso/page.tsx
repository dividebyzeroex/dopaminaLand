'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Here you could fetch the session status or just display the form
  // In a real implementation, you would have an API route to submit this form
  // and update the donations_catalog record where stripe_checkout_id = sessionId

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-neon-green/30 bg-neon-green/5 p-8 neon-border text-center">
        <span className="text-6xl block mb-4">🎉</span>
        <h1 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground">
          Doação Confirmada!
        </h1>
        <p className="mt-2 text-muted">
          Muito obrigado por patrocinar o Dopamina Brasil! O seu dinheiro (esse sim real) 
          ajuda a manter nossa capivara alimentada e os servidores rodando.
        </p>

        {sessionId && (
          <div className="mt-8 rounded-xl bg-card p-6 border border-border text-left">
            <h2 className="text-xl font-bold text-foreground">Sua Recompensa 🏆</h2>
            <p className="mt-1 text-sm text-muted">
              Como patrocinador, você tem o direito de criar um produto 100% fictício para o nosso catálogo.
              Preencha os dados abaixo (em breve, funcionalidade completa de envio):
            </p>
            
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Em breve!'); }}>
              <div>
                <label className="block text-sm font-bold text-foreground">Nome do Produto</label>
                <input type="text" className="mt-1 w-full rounded-lg bg-surface-light border border-border p-3 text-sm text-foreground focus:border-magenta outline-none" placeholder="Ex: RTX 9090 (Edição de Ouro)" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground">Preço Falso (R$)</label>
                <input type="number" className="mt-1 w-full rounded-lg bg-surface-light border border-border p-3 text-sm text-foreground focus:border-magenta outline-none" placeholder="99999.99" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground">Emoji / URL da Imagem</label>
                <input type="text" className="mt-1 w-full rounded-lg bg-surface-light border border-border p-3 text-sm text-foreground focus:border-magenta outline-none" placeholder="🤖" required />
              </div>
              
              <button className="w-full rounded-xl bg-magenta py-3 font-bold text-white transition hover:bg-magenta-light mt-4">
                Enviar Produto para Moderação
              </button>
            </form>
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-sm font-bold text-magenta hover:underline">
            ← Voltar para a loja falsa
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
