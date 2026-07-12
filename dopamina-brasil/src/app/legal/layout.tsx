import Link from 'next/link';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Transparência & Legal | Dopamina Brasil',
  description: 'Políticas, LGPD e Termos de Uso da Dopamina Brasil.',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">
            Central de <span className="text-neon">Transparência</span>
          </h1>
          <p className="mt-2 text-muted max-w-2xl">
            Tudo o que você precisa saber sobre como lidamos com as suas simulações de compra e seus dados (se é que coletamos algum).
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-24 flex flex-col space-y-2">
              <Link 
                href="/legal/privacidade" 
                className="px-4 py-3 rounded-lg border border-border bg-surface text-sm font-bold text-foreground hover:bg-neon/10 hover:text-neon hover:border-neon/30 transition-colors"
              >
                🔒 Política de Privacidade
              </Link>
              <Link 
                href="/legal/termos" 
                className="px-4 py-3 rounded-lg border border-border bg-surface text-sm font-bold text-foreground hover:bg-neon/10 hover:text-neon hover:border-neon/30 transition-colors"
              >
                📜 Termos de Uso
              </Link>
              <Link 
                href="/legal/lgpd" 
                className="px-4 py-3 rounded-lg border border-border bg-surface text-sm font-bold text-foreground hover:bg-neon/10 hover:text-neon hover:border-neon/30 transition-colors"
              >
                ⚖️ LGPD & Dados
              </Link>
            </nav>
          </aside>

          {/* Page Content */}
          <section className="flex-1 min-w-0">
            <div className="bg-surface border border-border rounded-xl p-6 sm:p-10 shadow-xl">
              {children}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
