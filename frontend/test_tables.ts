
import { supabase } from './src/lib/supabase';

async function test() {
    const { data, error } = await supabase
        .from('employer_saved_candidates')
        .select('*');

    if (error) {
        console.error('Table employer_saved_candidates does not exist or error:', error.message);
    } else {
        console.log('Table employer_saved_candidates exists, data:', data);
    }

    const { data: data2, error: error2 } = await supabase
        .from('user_candidate_activities')
        .select('*');

    if (error2) {
        console.error('Table user_candidate_activities does not exist or error:', error2.message);
    } else {
        console.log('Table user_candidate_activities exists, data:', data2);
    }
}

test();
