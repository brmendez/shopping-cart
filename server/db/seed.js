const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { PRODUCTS } = require('./productsAPISeed');

// A few first-page products start low so visitors can sell them out.
const LOW_STOCK_TITLES = [
	'Red Lipstick',
	'Calvin Klein CK One',
	'Chanel Coco Noir Eau De',
];
const LOW_STOCK_QUANTITY = 3;

// Upsert by title so product IDs stay stable and carts survive a re-seed.
async function seed() {
	const { error: upsertError } = await supabaseAdmin.from('products').upsert(
		Object.values(PRODUCTS.products).map((product) => {
			const stock = LOW_STOCK_TITLES.includes(product.title)
				? LOW_STOCK_QUANTITY
				: product.stock;

			return {
				title: product.title,
				stock,
				full_stock: stock,
				description: product.description,
				category: product.category,
				price: product.price,
				images: product.images,
				thumbnail: product.thumbnail,
			};
		}),
		{ onConflict: 'title' }
	);

	if (upsertError) throw upsertError;

	console.log(`Seeded ${PRODUCTS.products.length} products.`);
}

seed().catch((error) => {
	console.error('Seeding failed:', error);
	process.exit(1);
});
