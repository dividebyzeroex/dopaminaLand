const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'dopamina-insights/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: installs, error: err1 } = await supabase
    .from('intent_events')
    .select('*')
    .eq('event_type', 'bookmarklet_installed');
  console.log('Installs:', installs?.length, err1);

  const { data: audits, error: err2 } = await supabase
    .from('intent_events')
    .select('*')
    .eq('event_type', 'dark_pattern_audit');
  console.log('Audits:', audits?.length, err2);
}
check();
