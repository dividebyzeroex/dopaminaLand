-- 004: alertas de preço por push (app instalado / navegador).
-- Acesso só pelo servidor com a SUPABASE_SERVICE_ROLE_KEY: RLS ligado e nenhuma policy pública.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE CHECK (char_length(endpoint) <= 1000),
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS price_watches (
  id BIGSERIAL PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  product_path TEXT NOT NULL,
  product_name TEXT,
  notify_drop BOOLEAN NOT NULL DEFAULT true,
  notify_rise BOOLEAN NOT NULL DEFAULT false,
  notify_stable BOOLEAN NOT NULL DEFAULT true,
  base_price NUMERIC(12,2),
  last_price NUMERIC(12,2),
  last_change_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, product_path)
);

CREATE INDEX IF NOT EXISTS idx_price_watches_path ON price_watches (product_path);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_watches ENABLE ROW LEVEL SECURITY;
