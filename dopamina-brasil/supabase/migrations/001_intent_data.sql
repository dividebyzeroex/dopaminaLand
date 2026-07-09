-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: sessions (Anonymous, no PII)
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT now(),
  device_info JSONB DEFAULT '{}'
);

-- Table: intent_events (Behavioral tracking)
CREATE TABLE intent_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- e.g., 'view_item', 'add_to_cart', 'fake_checkout', 'dwell_time_exceeded'
  product_id INT,
  price_displayed NUMERIC(12,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: donations_catalog (Custom fake products created by donors)
CREATE TABLE donations_catalog (
  id BIGSERIAL PRIMARY KEY,
  stripe_checkout_id TEXT UNIQUE,
  backer_name TEXT,
  product_name TEXT,
  image_url TEXT,
  fake_price NUMERIC(12,2) DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations_catalog ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can insert a session (anonymous users)
CREATE POLICY "Enable insert for anonymous sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for anonymous sessions" ON sessions FOR SELECT USING (true);

-- Anyone can insert intent events
CREATE POLICY "Enable insert for intent events" ON intent_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for intent events" ON intent_events FOR SELECT USING (true);

-- Only authenticated backend (service role) can insert/update donations_catalog
CREATE POLICY "Enable read for approved donations" ON donations_catalog FOR SELECT USING (approved = true);

-- Note: In a production app with auth, we would restrict the above.
-- Here we rely on the service_role key to bypass RLS for administrative inserts (like webhooks).

-- Indexes for performance
CREATE INDEX idx_intent_session ON intent_events(session_id);
CREATE INDEX idx_intent_created_at ON intent_events(created_at);
CREATE INDEX idx_donations_approved ON donations_catalog(approved) WHERE approved = true;
