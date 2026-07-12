export default function LegalIndexPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-foreground">Bem-vindo à nossa aba mais chata (mas necessária)</h2>
      <p className="text-muted leading-relaxed">
        Você está navegando pelo projeto Dopamina Brasil. Esta plataforma é uma loja de simulação construída para explorar como nosso cérebro reage ao consumismo digital e às dinâmicas de e-commerce.
      </p>
      <p className="text-muted leading-relaxed">
        Como os nossos produtos são falsos e tudo custa R$ 0,00, a nossa preocupação número um é proteger <strong>as suas informações de verdade</strong>.
      </p>
      <p className="text-muted leading-relaxed">
        Utilize o menu lateral para entender como tratamos seus dados (spoiler: nós praticamente não tratamos), quais são as regras do jogo e como funciona o resgate de recompensas físicas para os usuários que atingem o nível máximo no nosso programa de XP.
      </p>
      <div className="mt-8 p-4 bg-neon/10 border border-neon/20 rounded-lg">
        <p className="text-sm font-bold text-neon uppercase tracking-wider text-center">
          Selecione uma opção no menu lateral para continuar.
        </p>
      </div>
    </div>
  );
}
