export const metadata = { title: "Dados pessoais e seus direitos" };
export default function Page() {
  const email = process.env.PRIVACY_CONTACT_EMAIL;
  return <div className="space-y-6 max-w-none">
    <h2 className="text-2xl font-black text-foreground border-b border-border pb-4">Dados pessoais e seus direitos</h2>
    <p className="text-muted">Última atualização: 20/11/2026</p>
    <div className="space-y-8">
        <section><h3 className="text-lg font-bold">Transparência</h3><p className="text-muted leading-relaxed mt-2">Esta página descreve os controles disponíveis e os direitos relativos aos dados pessoais. A operação atual é um comparador de preços, não uma simulação de compras com perfil ou ranking.</p></section>
        <section><h3 className="text-lg font-bold">Seus direitos</h3><p className="text-muted leading-relaxed mt-2">Você pode solicitar confirmação de tratamento, acesso, correção, informação sobre compartilhamento, oposição e eliminação nos casos previstos pela LGPD. Solicitações que envolvam dados de outras pessoas exigem verificação adequada de identidade.</p></section>
        <section><h3 className="text-lg font-bold">Controles no aparelho</h3><p className="text-muted leading-relaxed mt-2">Remova produtos em Meus alertas para cancelar o acompanhamento. Revogue notificações e limpe os dados do site nos ajustes do navegador. A limpeza local não é uma solicitação de exclusão dos registros do servidor.</p></section>
        <section><h3 className="text-lg font-bold">Contato</h3><p className="text-muted leading-relaxed mt-2">Use o canal de contato do responsável indicado abaixo para solicitar um meio privado de atendimento. Não publique dados pessoais em issues públicas. O canal e a identificação formal do controlador devem ser mantidos atualizados pelo responsável pelo serviço.</p></section>
      <p>{email ? <a href={`mailto:${email}`}>Contato de privacidade</a> : <a href="https://github.com/dividebyzeroex" target="_blank" rel="noopener noreferrer">Responsável pelo projeto</a>}</p>
    </div>
  </div>;
}
