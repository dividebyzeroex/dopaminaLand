-- 010: laboratório de crescimento. Memória compartilhada entre as rotinas que publicam e analisam posts.
-- Só servidor (RLS ligado, nenhuma policy pública).
CREATE TABLE IF NOT EXISTS growth_posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  platform TEXT NOT NULL DEFAULT 'instagram',
  media_id TEXT UNIQUE,
  permalink TEXT,
  format TEXT,            -- reel | carrossel | story
  theme TEXT,             -- produto/tema em destaque
  hook TEXT,              -- estilo do gancho (linha-do-tempo-de-preco, veredito, fato-de-mercado, tutorial...)
  cta TEXT,               -- comentar-pago-espero, mandar-raiox, salvar...
  slot TEXT,              -- manha | tarde | noite (ou horário)
  experiment TEXT,        -- nome do experimento (ex.: volume-3-vs-6)
  arm TEXT,               -- braço do experimento (ex.: controle, variante-a)
  hypothesis TEXT,
  source TEXT NOT NULL DEFAULT 'auto',   -- auto | manual | backfill
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb  -- snapshots: {"3h": {...}, "24h": {...}, "72h": {...}}
);
CREATE INDEX IF NOT EXISTS idx_growth_posts_published ON growth_posts (published_at DESC);

CREATE TABLE IF NOT EXISTS growth_notes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL CHECK (kind IN ('protocolo', 'aprendizado', 'relatorio', 'decisao', 'baseline')),
  body TEXT NOT NULL,
  meta JSONB
);
CREATE INDEX IF NOT EXISTS idx_growth_notes_kind ON growth_notes (kind, created_at DESC);

ALTER TABLE growth_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_notes ENABLE ROW LEVEL SECURITY;
