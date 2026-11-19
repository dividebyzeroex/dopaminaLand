-- 003 (PENDENTE — NÃO aplicar ainda)
--
-- Hoje qualquer pessoa com a chave pública (que vai no JavaScript do site) consegue LER
-- todas as linhas de `sessions` e `intent_events` (URLs visitadas, buscas, dispositivo).
-- Isso é um risco de LGPD.
--
-- Pré-requisitos antes de aplicar:
--   1. Criar SUPABASE_SERVICE_ROLE_KEY na Vercel (projetos dopamina-land e dopamina-land-insights).
--   2. Mover as leituras do painel dopamina-insights (src/hooks/useInsightsData.ts) para rotas
--      de servidor que usem a service role, protegidas por login.
--   3. Mudar /api/recent-searches para getServiceSupabase().
-- Depois disso, mover este arquivo para supabase/migrations/ e aplicar.

DROP POLICY IF EXISTS "Enable read for anonymous sessions" ON sessions;
DROP POLICY IF EXISTS "Enable read for intent events" ON intent_events;
