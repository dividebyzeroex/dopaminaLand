# Operação do Dopamina

## Projetos de produção confirmados em 20/11/2026

- Site: projeto Vercel `dopamina-land`, repositório `dividebyzeroex/dopaminaLand`, diretório `dopamina-brasil`.
- Painel publicado: projeto Vercel `dopamina-land-insights`, repositório separado `dividebyzeroex/dopaminaLandHQ`. Alterar a pasta `dopamina-insights` deste repositório não atualiza esse painel.
- Banco compartilhado: projeto Supabase `supabase-agendai` (`vvanjarfwdxtzklogysy`). As alterações do Dopamina devem ficar restritas às suas tabelas; não modificar permissões globais ou objetos do Agenda AI.
- A migration `002` foi aplicada e validada. As migrations `004` e `005` já constavam no banco, com o cron `dopamina-price-watch` ativo. A existência do cron e do segredo no Vault não comprova a entrega de notificações.
- A migration `003` ainda depende da publicação dos consumidores compatíveis. No painel do repositório `dopaminaLandHQ`, configurar `SUPABASE_SERVICE_ROLE_KEY` em Production e fazer redeploy. Essa versão usa login por cookie assinado, não `INSIGHTS_USERNAME`. Por decisão do responsável, a senha fixa existente será mantida, sem exigir `INSIGHTS_PASSWORD`. Como essa senha consta no código, ela não oferece proteção contra quem a conhece; manter a proteção de deployment da Vercel.

## Ordem de ativação

1. Na Vercel, configure `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em `dopamina-land` e no projeto do painel efetivamente publicado. A service role é segredo exclusivo do servidor: nunca usar prefixo NEXT_PUBLIC. Configure preview com um banco separado de produção.
2. Para a aplicação da pasta `dopamina-insights` deste repositório, configure `INSIGHTS_USERNAME` e `INSIGHTS_PASSWORD` (senha aleatória com pelo menos 20 caracteres). O navegador solicita HTTP Basic; use somente HTTPS. Sem configuração, o painel e todas as APIs respondem 503. Senhas incorretas retornam 401. Alterar a senha revoga as credenciais anteriores. Ative também a proteção de deployment da Vercel. Para o painel separado atualmente publicado, siga a configuração descrita acima.
3. Publique os dois aplicativos com consultas privadas no servidor. Valide o painel autenticado e a coleta de telemetria antes de retirar as permissões antigas.
4. Aplique `001`/`002` se ainda não aplicadas. Depois aplique `003_lock_down_analytics_reads.sql`: ela revoga SELECT/INSERT/UPDATE/DELETE públicos de sessions, intent_events e price_alerts e mantém a service role. Não apaga registros. Como 003 estava pendente fora da pasta, ambientes que já aplicaram 004/005 precisam aplicar 003 explicitamente; não presumir que um push de código executa SQL.
5. Confirme com `has_table_privilege` que anon/authenticated não podem ler ou alterar as três tabelas e que o painel autenticado continua lendo. Execute os advisors do Supabase. Nunca copie contatos ou sessões para logs de validação.
6. Para push, aplique `004_push_alerts.sql`, configure NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT e CRON_SECRET. Cadastre no Vault do Supabase o mesmo CRON_SECRET com nome `dopamina_cron_secret`, sem o incluir no Git. Aplique `005_hourly_price_watch.sql` (pg_cron/pg_net: minuto 7 de cada hora).
7. Para os destaques de queda dos produtos mais buscados, aplique `006_trending_drops.sql` (colunas `notify_trending` e `last_trending_at` em `push_subscriptions` e tabela `trending_drop_notices`). Não há cron novo: a checagem horária (`/api/cron/price-watch`) faz essa etapa às 10h, 13h, 16h e 19h de São Paulo. Cada aparelho recebe no máximo 1 aviso por dia; só entram produtos com veredito "Desconto real" ou "Abaixo do normal" e queda de 3%+ sobre os 3 dias anteriores; o mesmo produto não se repete por 7 dias, salvo nova queda de 3%. Quem tem push ativo recebe por padrão e desliga no aviso de alerta, em Meus alertas ou no botão "Parar destaques" da notificação. Sem a 006, a resposta do cron traz `digest.reason: "migration 006 pendente"` e os alertas por produto seguem normais. Para testar fora do horário: `GET /api/cron/price-watch?destaques=agora` com o mesmo `Authorization: Bearer $CRON_SECRET`.
8. Valide `/api/alerts/status` (200 e ready:true), o cron autenticado, suas execuções no Supabase e uma inscrição real de teste. Um status pronto só confirma configuração e tabelas, não entrega de notificações ou execução do agendador. Cadastros e env vars novos requerem redeploy quando afetam o bundle público.
9. Configure `PRIVACY_CONTACT_EMAIL` com um canal efetivamente atendido e revise identificação do controlador, retenção e bases legais com o responsável antes de divulgação ampla. O código não declara certificação de conformidade legal.

## Rotas e dados das aplicações deste repositório

- O painel usa `/api/analytics/data` e `/api/analytics/leads`, autenticadas no próprio handler e no proxy, sem acesso público direto ao Supabase.
- O painel atualiza a cada 30 segundos quando visível, mantendo o filtro de datas. Consultas retornam até 1.000 linhas; o painel avisa quando a amostra está truncada. Não interpretar métricas da amostra como totais exatos.
- A sincronização HubSpot existe somente no projeto Insights em `/api/crm/hubspot`; o site público retorna 410. O endpoint antigo `/api/price-alerts`, que enviava mensagens sem autenticação, também retorna 410. Contatos históricos continuam disponíveis somente no painel.
- O rate limit em memória reduz abuso por instância; configure rate limiting distribuído no Firewall da Vercel para ingestão pública e login. Não é um limite global.
- Novas sessões não recebem gênero inventado, e-mail legado ou IP bruto coletado pelo servidor. Isso não remove dados históricos já existentes.
- Alertas locais continuam funcionando sem push: a interface identifica essa limitação. Nunca afirmar entrega horária quando o cadastro no servidor falhou.
- A coleta por HTML depende da estrutura e disponibilidade do Buscapé. Monitore falhas e valide mudanças de parser com fixtures antes de publicar.

## Verificação local e CI

`npm test`, `npm run lint` (site), `npm run typecheck`, `npm audit --omit=dev --audit-level=high` e `npm run build`.
A CI usa Node 24, ações fixadas por SHA e somente permissão de leitura. O build não precisa de segredos de produção; páginas públicas podem usar conteúdo de reserva se a fonte externa estiver indisponível.
Torne os checks obrigatórios na proteção de main ou em Deployment Checks antes de habilitar merges automáticos.

## Reversão

Não restaure policies públicas para contornar erro de configuração. Corrija as credenciais/rotas protegidas ou suspenda temporariamente o painel. Use rollback da Vercel apenas para uma versão compatível com o banco já protegido. As migrations não removem dados.
