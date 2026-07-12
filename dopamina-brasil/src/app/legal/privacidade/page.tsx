import React from 'react';

export const metadata = {
  title: 'Política de Privacidade | Dopamina Brasil',
};

export default function PrivacidadePage() {
  return (
    <div className="space-y-6 prose prose-invert max-w-none">
      <h2 className="text-2xl font-black text-foreground border-b border-border pb-4">Política de Privacidade</h2>
      
      <p className="text-muted leading-relaxed">
        <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div className="space-y-8 mt-8">
        <section>
          <h3 className="text-lg font-bold text-foreground">1. O que nós NÃO coletamos</h3>
          <p className="text-muted leading-relaxed mt-2">
            Como somos uma loja de brincadeira, onde tudo custa gloriosos R$ 0,00, nós <strong>nunca pedimos, processamos ou armazenamos</strong> dados de cartão de crédito, informações bancárias, PIX ou histórico financeiro. O gateway de pagamento é apenas visual e não processa transações.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">2. O que nós coletamos</h3>
          <p className="text-muted leading-relaxed mt-2">
            Nós armazenamos apenas o básico para que você possa participar do nosso experimento gamificado:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-muted">
            <li><strong>Nome e E-mail:</strong> Usados exclusivamente para criar o seu perfil no Supabase e manter o seu ranking.</li>
            <li><strong>XP e Nível:</strong> Registramos suas interações no site (adicionar ao carrinho, simular checkout) para calcular sua pontuação de dopamina.</li>
            <li><strong>Endereço Físico (Apenas sob demanda):</strong> Se você atingir os níveis mais altos (Top Levels) e for elegível para receber um brinde físico (swag), pediremos o seu endereço de entrega. Esse endereço é usado de forma isolada, exclusiva para o envio do prêmio, e não é compartilhado com terceiros além dos correios/transportadoras parceiras.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">3. Uso de Cookies (As bolachas digitais)</h3>
          <p className="text-muted leading-relaxed mt-2">
            Usamos <em>cookies</em> locais e <em>AsyncStorage</em> para lembrar se você já fechou pop-ups chatos (como o nosso banner "Isso é uma sátira"), para manter sua sessão de login ativa e guardar o seu progresso offline. Não rastreamos a sua navegação para fora deste site, nem enviamos anúncios para te perseguir no Instagram depois.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold text-foreground">4. Compartilhamento de Dados</h3>
          <p className="text-muted leading-relaxed mt-2">
            Seus dados ficam seguros nos bancos de dados do Supabase e nós não os vendemos, trocamos ou alugamos para ninguém. Nem mesmo se oferecerem pagar nossas contas de servidor.
          </p>
        </section>
      </div>
    </div>
  );
}
