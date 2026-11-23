-- 008: Raio-X por mensagem (webhook do Zernio): métricas dos pedidos e alertas de preço pelo Direct.
-- Acesso só pelo servidor com a SUPABASE_SERVICE_ROLE_KEY: RLS ligado e nenhuma policy pública.

-- Um registro por pedido. Sem identificar a pessoa: "convo" é um hash da conversa
-- (serve para saber qual produto ela pediu por último ao mandar "avisar").
CREATE TABLE IF NOT EXISTS raiox_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel TEXT NOT NULL,                       -- instagram | facebook | whatsapp | telegram ...
  source TEXT NOT NULL CHECK (source IN ('dm', 'comment')),
  outcome TEXT NOT NULL CHECK (outcome IN ('found', 'ask', 'not_found', 'blocked', 'limit', 'error')),
  query TEXT CHECK (char_length(query) <= 200),
  product_path TEXT,
  product_name TEXT,
  price NUMERIC(12,2),
  verdict TEXT,
  convo TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_raiox_requests_created ON raiox_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raiox_requests_convo ON raiox_requests (convo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raiox_requests_product ON raiox_requests (product_path) WHERE product_path IS NOT NULL;

-- Alertas pedidos pelo Direct ("avisar", "meta 1500"). Guarda a conversa para poder responder.
CREATE TABLE IF NOT EXISTS raiox_watches (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  account_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  product_path TEXT NOT NULL,
  product_name TEXT,
  target_price NUMERIC(12,2) NOT NULL CHECK (target_price > 0),
  price_at_request NUMERIC(12,2),
  hit_at TIMESTAMPTZ,            -- quando o preço chegou à meta
  hit_price NUMERIC(12,2),
  delivered_at TIMESTAMPTZ,      -- quando a mensagem foi entregue
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  stopped_at TIMESTAMPTZ,
  UNIQUE (conversation_id, product_path)
);
CREATE INDEX IF NOT EXISTS idx_raiox_watches_open ON raiox_watches (expires_at) WHERE stopped_at IS NULL AND delivered_at IS NULL;

ALTER TABLE raiox_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE raiox_watches ENABLE ROW LEVEL SECURITY;
