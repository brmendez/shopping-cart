const supabase = require('../lib/supabase');

async function getProducts(limit, page) {
  const offset = (page - 1) * limit;

	const { error: retrieveError, data, count } = await supabase.from('products')
	.select('*', { count: 'exact' })
	.order('id')
	.limit(limit)
	.range(offset, offset + limit - 1);

	if (retrieveError) throw retrieveError;

	return {
	  products: data,
	  total: count,
	};
}

module.exports = getProducts;
