
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('employer_saved_candidates').select('count');
    if (error) {
        console.log('employer_saved_candidates error:', error.message);
    } else {
        console.log('employer_saved_candidates exists');
    }

    const { data: data2, error: error2 } = await supabase.from('saved_candidates').select('count');
    if (error2) {
        console.log('saved_candidates error:', error2.message);
    } else {
        console.log('saved_candidates exists');
    }
}

check();
