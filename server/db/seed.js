const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { PRODUCTS } = require('./productsAPISeed');

// Upsert by title so product IDs stay stable and carts survive a re-seed.
async function seed() {
	const { error: upsertError } = await supabaseAdmin.from('products').upsert(
		Object.values(PRODUCTS.products).map((product) => ({
			title: product.title,
			stock: product.stock,
			description: product.description,
			category: product.category,
			price: product.price,
			images: product.images,
			thumbnail: product.thumbnail,
		})),
		{ onConflict: 'title' }
	);

	if (upsertError) throw upsertError;

	console.log(`Seeded ${PRODUCTS.products.length} products.`);
}

seed().catch((error) => {
	console.error('Seeding failed:', error);
	process.exit(1);
});
