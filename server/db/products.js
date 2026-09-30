const supabase = require('../lib/supabase');

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
    if (retrieveError.code === 'PGRST103') {
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

module.exports = getProducts;
