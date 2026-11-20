# Dopamina Insights

Painel interno do dopaminado.com.br: acessos, visitas, buscas, produtos e cliques em lojas,
com uma aba **Ao vivo** atualizada a cada 10 s e relatórios por período (hoje, 24 h, 7, 30 e 90 dias)
comparados ao período anterior de mesmo tamanho.

## Como funciona

- O site (`dopamina-brasil`) grava eventos em `intent_events` e o perfil do navegador em `sessions` (Supabase).
- O painel **não lê o banco pelo navegador**. As rotas de servidor fazem a leitura e a agregação:
  - `GET /api/insights/live`: últimos 30 min (presença, feed de atividade, pessoas por minuto) + resumo de hoje.
  - `GET /api/insights/report?range=today|24h|7d|30d|90d`: indicadores, série, funil, buscas, produtos, origem, páginas, visitas e Web Vitals.
  - `GET /api/insights/visitor/:id`: linha do tempo completa de um visitante.
- Toda a lógica de métricas está em `src/lib/analytics/core.ts` (funções puras, com testes em `tests/`).

## Definições

| Termo | Significado |
|---|---|
| Visitante | Um navegador (`session_id` salvo no localStorage do site). |
| Visita | Eventos do mesmo visitante sem pausa maior que 30 min. |
| Busca | Um termo pesquisado. Envio (`super_search`) e página de resultados (`search_results`) do mesmo termo em até 3 min contam uma vez. |
| Busca → produto | A busca foi seguida de um produto aberto em até 15 min. |
| Rejeição | Visita com até 1 página, sem busca, produto ou clique, e menos de 10 s. |
| Origem | UTM da primeira página; senão o referrer (Instagram, Google, WhatsApp…); sem referrer = Direto. |

Robôs (user agent de crawler/preview) ficam fora das contagens. Horários em America/Sao_Paulo.

## Eventos do site usados pelo painel

`page_view` (com referrer/UTM na entrada), `super_search`, `search_results` (quantidade, falha, bloqueio, descontos maquiados,
5 primeiros resultados), `search_blocked`, `product_view` (preço, veredito, loja), `offer_click` (loja, produto, posição),
`outbound_click`, `share_product`, `page_leave` (tempo na página), `web_vitals`, `js_error`, `rage_click`, `dead_click`.

## Variáveis de ambiente (Vercel → projeto dopamina-land-insights)

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Recomendada.** Leitura no servidor. Obrigatória antes de aplicar a migration 003 (que fecha a leitura pública). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Usada enquanto a service role não existir. |
| `INSIGHTS_PASSWORD` | Senha do painel. Sem ela vale a senha antiga e o painel mostra um aviso. |
| `INSIGHTS_SECRET` | Opcional: segredo do cookie de login (padrão: derivado da senha). |
| `POSTHOG_*`, `HUBSPOT_ACCESS_TOKEN`, `GA_*` | Aba Integrações (opcional). |

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # métricas
npm run build
```
