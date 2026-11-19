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

-- Alertas de preço (a rota /api/price-alerts já usa esta tabela, mas ela não estava versionada).
CREATE TABLE IF NOT EXISTS price_alerts (
  id BIGSERIAL PRIMARY KEY,
  contact TEXT NOT NULL CHECK (char_length(contact) <= 200),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  product_name TEXT CHECK (char_length(product_name) <= 300),
  product_path TEXT,
  current_price NUMERIC(12,2) DEFAULT 0,
  target_price NUMERIC(12,2) NOT NULL CHECK (target_price > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
-- Cadastro anônimo permitido; ninguém lê contatos com a chave pública.
DROP POLICY IF EXISTS "Anonymous can create alerts" ON price_alerts;
CREATE POLICY "Anonymous can create alerts" ON price_alerts FOR INSERT WITH CHECK (true);
