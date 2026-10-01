const { supabaseAdmin } = require('../lib/supabaseAdmin');

// Restocking itself runs in Supabase (pg_cron job "restock-products").
async function getNextRestockAt() {
  const { error, data } = await supabaseAdmin.rpc('next_restock_at');

  if (error) throw error;

  return data;
}

module.exports = getNextRestockAt;
