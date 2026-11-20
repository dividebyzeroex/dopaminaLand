-- 002: histórico de preços próprio + tabela de alertas versionada.
-- Seguro para aplicar a qualquer momento: só cria objetos novos (IF NOT EXISTS).

-- Série diária de menor preço por produto e fonte.
-- Gravada pelo servidor com a SUPABASE_SERVICE_ROLE_KEY (ignora RLS).
CREATE TABLE IF NOT EXISTS price_observations (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,                 -- ex.: 'buscape'
  product_id TEXT NOT NULL,             -- id do produto na fonte
  product_path TEXT,                    -- slug usado em /produto/[...]
  product_name TEXT,
  day DATE NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price > 0),
  store TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, product_id, day)
);

CREATE INDEX IF NOT EXISTS idx_price_obs_product_day ON price_observations (source, product_id, day);
CREATE INDEX IF NOT EXISTS idx_price_obs_day ON price_observations (day DESC);

ALTER TABLE price_observations ENABLE ROW LEVEL SECURITY;
-- Preços são dados públicos: leitura liberada. Escrita somente via service role (sem policy de INSERT/UPDATE).
DROP POLICY IF EXISTS "Public read price observations" ON price_observations;
CREATE POLICY "Public read price observations" ON price_observations FOR SELECT USING (true);

-- Alertas de preço: a tabela já existe em produção (criada fora das migrations).
-- Definição espelhando o esquema real, para ambientes novos. Em produção o IF NOT EXISTS não altera nada.
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact TEXT,
  channel TEXT,
  product_name TEXT,
  current_price NUMERIC,
  target_price NUMERIC,
  is_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
-- Mantém a policy de INSERT que produção já tem ("Allow public insert").
-- A policy de leitura pública ("Allow public read") expõe contatos e é removida na 003 (pendente).
