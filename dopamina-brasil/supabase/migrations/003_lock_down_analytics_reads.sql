-- Deploy server-only readers/writers and configure service role in BOTH apps first.
-- Run once after migrations 001/002; rerunning is safe. No user rows are deleted.
BEGIN;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for anonymous sessions" ON public.sessions;
DROP POLICY IF EXISTS "Enable read for intent events" ON public.intent_events;
DROP POLICY IF EXISTS "Allow public read" ON public.price_alerts;
DROP POLICY IF EXISTS "Allow service role inserts on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow service role inserts on intent_events" ON public.intent_events;
DROP POLICY IF EXISTS "Enable insert for anonymous sessions" ON public.sessions;
DROP POLICY IF EXISTS "Enable insert for intent events" ON public.intent_events;
DROP POLICY IF EXISTS "Allow public insert" ON public.price_alerts;
-- Grants also close access in case an unversioned permissive policy exists.
REVOKE ALL ON TABLE public.sessions, public.intent_events, public.price_alerts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions, public.intent_events, public.price_alerts TO service_role;
COMMIT;
