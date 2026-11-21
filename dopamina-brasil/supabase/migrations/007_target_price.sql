-- 007: preço-alvo nos alertas. Só adiciona colunas; seguro para aplicar a qualquer momento.
ALTER TABLE price_watches ADD COLUMN IF NOT EXISTS target_price NUMERIC(12,2) CHECK (target_price IS NULL OR target_price > 0);
-- Quando o alvo foi atingido (avisa uma vez; volta a valer se o preço subir acima do alvo).
ALTER TABLE price_watches ADD COLUMN IF NOT EXISTS target_hit_at TIMESTAMPTZ;
