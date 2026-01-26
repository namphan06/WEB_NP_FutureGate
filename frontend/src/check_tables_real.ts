
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hrhoohbvmdmwkbqiymsb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaG9vaGJ2bWRtd2ticWl5bXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzE5MTgsImV4cCI6MjA4MDAwNzkxOH0.6YXPSDrZd9675WqS3vc1Xcn-bGHnqE50x-Kf2GNlVhc');

async function check() {
    const { data, error } = await supabase.from('employer_saved_candidates').select('count');
    if (error) console.log('employer_saved_candidates error:', error.message);
    else console.log('employer_saved_candidates exists');

    const { data: data2, error: error2 } = await supabase.from('user_candidate_activities').select('count');
    if (error2) console.log('user_candidate_activities error:', error2.message);
    else console.log('user_candidate_activities exists');

    // Try a broad query to see if we can get table list? (Probably not possible with anon key)
}

check();
