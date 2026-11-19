-- 003 (PENDENTE — NÃO aplicar ainda)
--
-- Hoje qualquer pessoa com a chave pública (que vai no JavaScript do site) consegue LER
-- todas as linhas de `sessions` e `intent_events` (URLs visitadas, buscas, dispositivo)
-- e de `price_alerts` (e-mails e telefones de quem pediu alerta). Isso é um risco de LGPD.
--
-- Pré-requisitos antes de aplicar:
--   1. Criar SUPABASE_SERVICE_ROLE_KEY na Vercel (projetos dopamina-land e dopamina-land-insights).
--   2. Mover as leituras do painel dopamina-insights (src/hooks/useInsightsData.ts e
--      src/components/dashboard/LeadsTab.tsx) para rotas
--      de servidor que usem a service role, protegidas por login.
--   3. Mudar /api/recent-searches, /api/track-session e /api/track-event para getServiceSupabase()
--      (o upsert de sessions hoje depende da policy FOR ALL removida abaixo).
-- Depois disso, mover este arquivo para supabase/migrations/ e aplicar.

DROP POLICY IF EXISTS "Enable read for anonymous sessions" ON sessions;
DROP POLICY IF EXISTS "Enable read for intent events" ON intent_events;
DROP POLICY IF EXISTS "Allow public read" ON price_alerts;
-- As policies "Allow service role ... " em sessions/intent_events são FOR ALL para o papel public
-- (anon incluso), apesar do nome. A service role já ignora RLS; remover também.
DROP POLICY IF EXISTS "Allow service role inserts on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow service role inserts on intent_events" ON intent_events;
