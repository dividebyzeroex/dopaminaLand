import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const payload = {
    session_id: "bd6a3b91-b706-4a6f-b361-084dd0376ce8",
    event_type: "dark_pattern_audit",
    product_id: "MERCADO LIVRE",
    price_displayed: 99,
    metadata: {
        store_name: "MERCADO LIVRE",
        url: "https://www.mercadolivre.com.br/",
        danger_score: 99,
        counts: {
            ancoragem: 5,
            enquadramento: 6,
            escassez: 0,
            fomo: 0,
            social: 1,
            dor: 0
        },
        triggers_count: 12
    }
  };

  const enrichedMetadata = {
    ...payload.metadata,
    raw_session_id: payload.session_id,
    store_name: payload.product_id
  };

  const { data, error } = await supabase.from('intent_events').insert({
    session_id: payload.session_id,
    event_type: payload.event_type,
    product_id: null,
    price_displayed: payload.price_displayed,
    metadata: enrichedMetadata
  });

  console.log("Insert result:", { data, error });
}

test();
