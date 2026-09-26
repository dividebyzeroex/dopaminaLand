# Dopamina: relatório de compra consciente

## Oferta implementada

Após uma busca gratuita, o usuário pode comprar por R$ 9,90 uma cópia imprimível dos resultados encontrados. O checkout usa Stripe Payment; a página `/relatorio` valida a sessão paga no servidor e mostra o retrato das ofertas salvo nos metadados da sessão. Não há assinatura nem promessa de alerta futuro.

## Para colocar à venda

1. Configure `STRIPE_SECRET_KEY` de produção no projeto Vercel `dopamina-land` e `SITE_URL=https://www.dopaminado.com.br`. Nunca use a chave secreta em variáveis `NEXT_PUBLIC_`.
2. Verifique que o domínio `www.dopaminado.com.br` corresponde à implantação deste aplicativo e que o checkout do Stripe da conta está habilitado para pagamentos reais.
3. Faça uma busca real; só ofereça o relatório quando houver produto, preço e link verificáveis na fonte. O checkout repete a consulta antes de criar uma sessão para evitar cobrar por resultado indisponível.
4. Faça uma compra real de baixo valor com cartão próprio, confirme o retorno ao relatório, confira os resultados impressos e realize o estorno na conta Stripe. Verifique também cancelamento e falha de fonte. Não publique anúncios pagos antes dessa checagem.
5. Monitore pagamentos concluídos, conversão entre análise e checkout, consultas sem resultado e pedidos de suporte. O relatório é um experimento de oferta; preço e disposição a pagar precisam ser validados.

## Limites conhecidos

A fonte atual é a página de resultados do Buscapé, lida por HTML; mudanças no site de origem podem interromper a busca. Os resultados podem ser produtos parecidos, sem garantia de modelo idêntico, frete, estoque, cupom ou cashback. O relatório contém a consulta pontual e o horário, não histórico de preço nem previsão. O identificador da sessão Stripe no link funciona como chave de acesso ao relatório: evite compartilhá-lo.
