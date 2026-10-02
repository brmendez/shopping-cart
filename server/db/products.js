const supabase = require('../lib/supabase');
const { PAGE_OUT_OF_RANGE } = require('../lib/dbErrorCodes');

// Products that only ever stock this many, so visitors can sell them out.
const SCARCE_FULL_STOCK = 3;

async function getProducts(limit, page) {
  const offset = (page - 1) * limit;

  const {
    error: retrieveError,
    data,
    count,
  } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('id')
    .range(offset, offset + limit - 1);

  if (retrieveError) {
    if (retrieveError.code === PAGE_OUT_OF_RANGE) {
      const { error: countError, count: total } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      return { products: [], total };
    }
    throw retrieveError;
  }

  return {
    products: data,
    total: count,
  };
}

// The few products that start tiny and sell out, featured in the hero on every page.
async function getScarceProducts() {
  const { error, data } = await supabase
    .from('products')
    .select('*')
    .lte('full_stock', SCARCE_FULL_STOCK)
    .order('id');

  if (error) throw error;

  return data;
}

module.exports = { getProducts, getScarceProducts };
