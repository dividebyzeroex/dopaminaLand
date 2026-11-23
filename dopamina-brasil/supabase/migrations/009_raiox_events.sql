-- 009: diário dos eventos do webhook do Zernio (o que chegou, o que o bot decidiu, resultado do envio).
-- Sem texto de mensagem nem identificador da pessoa. Só servidor (RLS ligado, nenhuma policy pública).
CREATE TABLE IF NOT EXISTS raiox_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event TEXT NOT NULL,
  platform TEXT,
  decision TEXT NOT NULL,
  story BOOLEAN NOT NULL DEFAULT false,
  has_text BOOLEAN NOT NULL DEFAULT false,
  send_status INT,
  detail JSONB
);
CREATE INDEX IF NOT EXISTS idx_raiox_events_created ON raiox_events (created_at DESC);
ALTER TABLE raiox_events ENABLE ROW LEVEL SECURITY;
