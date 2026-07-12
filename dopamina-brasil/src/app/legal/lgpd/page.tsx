import React from 'react';

export const metadata = {
  title: 'Tratamento de Dados & LGPD | Dopamina Brasil',
};

export default function LgpdPage() {
  return (
    <div className="space-y-6 prose prose-invert max-w-none">
      <h2 className="text-2xl font-black text-foreground border-b border-border pb-4">Tratamento de Dados e Direitos (LGPD)</h2>
      
      <p className="text-muted leading-relaxed">
        <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="space-y-8 mt-8">
        <section>
          <h3 className="text-lg font-bold text-foreground">1. Lei Geral de Proteção de Dados</h3>
          <p className="text-muted leading-relaxed mt-2">
            A Dopamina Brasil leva a privacidade a sério. Estamos em total conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018), porque, além de ser a lei, o nosso modelo de negócio fictício sequer gera dinheiro para nos dar o luxo de enfrentar processos jurídicos.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">2. A Base Legal do Tratamento</h3>
          <p className="text-muted leading-relaxed mt-2">
            Nós tratamos os poucos dados que coletamos (Email e Nome para perfil) sob a base legal do seu <strong>Consentimento</strong> (quando você faz login) e do <strong>Legítimo Interesse</strong> em operar o sistema de XP e ranking da nossa simulação. O endereço físico só é coletado para fins de <strong>Execução de Contrato</strong> no momento em que você decide resgatar um brinde real do Swag Lab, exigindo que saibamos para onde enviar.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">3. Seus Direitos como Titular</h3>
          <p className="text-muted leading-relaxed mt-2">
            A LGPD garante a você diversos direitos. Na Dopamina Brasil, você pode exercê-los a qualquer momento:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-muted">
            <li><strong>Direito de Acesso e Confirmação:</strong> Você pode acessar a sua aba de Perfil para visualizar exatamente tudo o que sabemos sobre você (que provavelmente é só seu e-mail e quantos mouses imaginários você "comprou").</li>
            <li><strong>Direito de Retificação:</strong> Você pode atualizar o seu nome a qualquer momento.</li>
            <li><strong>Direito de Apagamento (Exclusão):</strong> Você pode solicitar a exclusão definitiva da sua conta e do seu XP. (Estamos adicionando um botão "Nuclear Account" diretamente no painel. Enquanto ele não sai, basta nos enviar um e-mail).</li>
            <li><strong>Direito à Portabilidade:</strong> Quer baixar o seu histórico de carrinho invisível? Nós exportamos em JSON para você se solicitar.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">4. Encarregado de Dados (DPO)</h3>
          <p className="text-muted leading-relaxed mt-2">
            Para dúvidas, pedidos de exclusão, relatórios de vulnerabilidade ou se você quiser nos dizer o quão inútil foi a sua última compra de R$ 0,00, entre em contato com nosso DPO (que também é nosso desenvolvedor e nosso suporte):
          </p>
          <p className="mt-2 p-4 bg-surface border border-border rounded-lg inline-block">
            <span className="font-bold text-neon">E-mail:</span> privacidade@dopaminado.com.br (Fictício para este projeto)
          </p>
        </section>
      </div>
    </div>
  );
}
