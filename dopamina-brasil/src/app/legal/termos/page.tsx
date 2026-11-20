export const metadata = { title: "Termos de Uso" };
export default function Page() {
  const email = process.env.PRIVACY_CONTACT_EMAIL;
  return <div className="space-y-6 max-w-none">
    <h2 className="text-2xl font-black text-foreground border-b border-border pb-4">Termos de Uso</h2>
    <p className="text-muted">Última atualização: 20/11/2026</p>
    <div className="space-y-8">
        <section><h3 className="text-lg font-bold">Finalidade</h3><p className="text-muted leading-relaxed mt-2">O Dopamina é uma ferramenta gratuita de comparação e histórico de preços. Não é uma loja e não oferece ranking, pontos ou recompensas pela pesquisa. Links externos levam a ofertas de terceiros.</p></section>
        <section><h3 className="text-lg font-bold">Preços e metodologia</h3><p className="text-muted leading-relaxed mt-2">Os dados vêm de páginas públicas do Buscapé e das observações armazenadas pelo serviço. Podem existir atrasos de atualização, indisponibilidade da fonte, ofertas incompletas ou produtos semelhantes. Confira modelo, vendedor, frete, estoque, cupons e condições na loja antes de comprar.</p></section>
        <section><h3 className="text-lg font-bold">Vereditos</h3><p className="text-muted leading-relaxed mt-2">Os vereditos são comparações estatísticas com o histórico disponível, conforme a metodologia publicada. Não são garantia de desconto, previsão de preços futuros ou prova de intenção de uma loja. Um preço estável não garante que continuará estável.</p></section>
        <section><h3 className="text-lg font-bold">Alertas</h3><p className="text-muted leading-relaxed mt-2">Notificações dependem das permissões do aparelho, disponibilidade dos serviços e configuração do servidor. A checagem horária só está disponível quando o alerta por push é confirmado. No modo local, abra o site para verificar os preços; a execução com o app fechado não é garantida.</p></section>
        <section><h3 className="text-lg font-bold">Contribuições e uso adequado</h3><p className="text-muted leading-relaxed mt-2">Contribuições voluntárias, quando disponíveis, são pagamentos reais separados da pesquisa gratuita. Não use automação abusiva para sobrecarregar o serviço, manipular métricas ou acessar dados de outras pessoas.</p></section>
      <p>{email ? <a href={`mailto:${email}`}>Contato de privacidade</a> : <a href="https://github.com/dividebyzeroex" target="_blank" rel="noopener noreferrer">Responsável pelo projeto</a>}</p>
    </div>
  </div>;
}
