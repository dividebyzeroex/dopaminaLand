export default function LegalIndexPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-foreground">Termos e privacidade</h2>
      <p className="text-muted leading-relaxed">
        O Dopamina é um comparador de preços com histórico e alertas. Consulte aqui as regras de uso, os limites da análise e o tratamento dos seus dados.
      </p>
      <p className="text-muted leading-relaxed">
        A pesquisa e o relatório de preços são gratuitos. As compras acontecem nas lojas indicadas; contribuições voluntárias, quando disponíveis, usam um checkout separado.
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
