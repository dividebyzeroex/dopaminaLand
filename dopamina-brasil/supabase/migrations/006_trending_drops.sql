-- 006: destaques de queda dos produtos mais buscados (push periódico).
-- Só cria objetos novos; seguro para aplicar a qualquer momento.
-- Acesso só pelo servidor com a service role: RLS ligado e nenhuma policy pública.

-- Preferência do aparelho: receber destaques (padrão: sim; desliga em "Meus alertas"
-- ou no botão "Parar destaques" da própria notificação).
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS notify_trending BOOLEAN NOT NULL DEFAULT true;
-- Último aviso de destaques enviado ao aparelho (no máximo 1 por dia).
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS last_trending_at TIMESTAMPTZ;

-- Último destaque de cada produto, para não repetir a mesma queda por 7 dias.
CREATE TABLE IF NOT EXISTS trending_drop_notices (
  product_path TEXT PRIMARY KEY,
  product_name TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price > 0),
  previous_price NUMERIC(12,2),
  verdict TEXT,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipients INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE trending_drop_notices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON trending_drop_notices FROM anon, authenticated;
