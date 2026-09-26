import React from 'react';

export const metadata = {
  title: 'Termos de Uso | Dopamina Brasil',
};

export default function TermosPage() {
  return (
    <div className="space-y-6 prose prose-invert max-w-none">
      <h2 className="text-2xl font-black text-foreground border-b border-border pb-4">Termos de Uso</h2>
      
      <p className="text-muted leading-relaxed">
        <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="space-y-8 mt-8">
        <section>
          <h3 className="text-lg font-bold text-foreground">1. Aceitação do Irreal</h3>
          <p className="text-muted leading-relaxed mt-2">
            A loja gamificada simula compras e não entrega produtos. A pesquisa de preços e o relatório compartilhável são gratuitos e têm finalidade informativa.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">2. O Jogo e os Níveis de Dopamina</h3>
          <p className="text-muted leading-relaxed mt-2">
            A plataforma opera em um sistema de experiência (XP). Você ganha XP ao interagir com o site (simular compras, navegar por produtos). O XP não possui valor monetário, não é uma criptomoeda, e não pode ser transferido ou vendido.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">3. Swag Lab e Recompensas Reais</h3>
          <p className="text-muted leading-relaxed mt-2">
            O único elemento físico deste projeto são os brindes (Swag). Caso você acumule a quantidade necessária de XP e atinja um nível elegível, você poderá resgatar brindes do projeto (como adesivos, camisas ou garrafas, a depender da disponibilidade).
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-muted">
            <li>O resgate de brindes é gratuito, incluindo o frete.</li>
            <li>Limitado ao estoque do mês (bancado pelo nosso próprio bolso).</li>
            <li>O direito ao brinde pode ser revogado caso detectemos o uso de bots, scripts automáticos ou qualquer tentativa de burlar a pontuação de XP (jogue limpo).</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">4. Compras simuladas e pesquisa de preços</h3>
          <p className="text-muted leading-relaxed mt-2">
            O checkout da loja simulada não cobra dinheiro. O relatório de preços pode ser impresso ou salvo como PDF gratuitamente. Cada abertura do link faz uma nova consulta. Preços, frete, estoque e condições podem mudar; resultados de busca podem apresentar modelos diferentes. Confira a oferta na loja antes de comprar. Contribuições voluntárias, quando disponíveis, são identificadas separadamente como pagamentos reais.
          </p>
        </section>
        
        <section>
          <h3 className="text-lg font-bold text-foreground">5. Limitação de Responsabilidade</h3>
          <p className="text-muted leading-relaxed mt-2">
            Não nos responsabilizamos pela tristeza imediata ou longo prazo decorrente da constatação de que você não vai receber aquele super computador holográfico que comprou por R$ 0,00 no nosso site.
          </p>
        </section>
      </div>
    </div>
  );
}
