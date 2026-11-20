-- 005: checagem de alertas de hora em hora, agendada no próprio Supabase.
-- Chama https://www.dopaminado.com.br/api/cron/price-watch aos 7 minutos de cada hora.
--
-- Pré-requisito (uma vez, fora deste arquivo, para o segredo não ir para o Git):
--   select vault.create_secret('<mesmo valor do CRON_SECRET da Vercel>', 'dopamina_cron_secret');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Recria o job se já existir (idempotente).
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'dopamina-price-watch';

SELECT cron.schedule(
  'dopamina-price-watch',
  '7 * * * *',
  $job$
  SELECT net.http_get(
    url := 'https://www.dopaminado.com.br/api/cron/price-watch',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'dopamina_cron_secret')
    ),
    timeout_milliseconds := 290000
  );
  $job$
);
