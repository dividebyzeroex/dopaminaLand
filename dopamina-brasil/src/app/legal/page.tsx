export default function LegalIndexPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-foreground">Bem-vindo à nossa aba mais chata (mas necessária)</h2>
      <p className="text-muted leading-relaxed">
        Você está navegando pelo projeto Dopamina Brasil. Esta plataforma é uma loja de simulação construída para explorar como nosso cérebro reage ao consumismo digital e às dinâmicas de e-commerce.
      </p>
      <p className="text-muted leading-relaxed">
        As compras na loja gamificada são simuladas. A pesquisa e o relatório de preços são gratuitos; contribuições voluntárias, quando disponíveis, usam um checkout separado.
      </p>
      <p className="text-muted leading-relaxed">
        Utilize o menu lateral para entender o tratamento dos seus dados, as regras da experiência e os limites da pesquisa de preços.
      </p>
      <div className="mt-8 p-4 bg-neon/10 border border-neon/20 rounded-lg">
        <p className="text-sm font-bold text-neon uppercase tracking-wider text-center">
          Selecione uma opção no menu lateral para continuar.
        </p>
      </div>
    </div>
  );
}
