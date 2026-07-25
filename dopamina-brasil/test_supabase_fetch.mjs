import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/joaopaulo/Documents/Dopamina/dopamina-brasil/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchLatest() {
  const { data, error } = await supabase
    .from('intent_events')
    .select('id, event_type, created_at, metadata')
    .eq('event_type', 'dark_pattern_audit')
    .order('created_at', { ascending: false });
    
  console.log("Fetch error:", error);
  console.log("Total dark pattern audits:", data?.length);
  if (data?.length) {
    console.log("First 3:", data.slice(0, 3));
  }
}

fetchLatest();
