// TODO: Convert to TS?
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error(`Missing PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY. `);
}

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
