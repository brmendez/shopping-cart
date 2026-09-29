const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { PRODUCTS } = require('./productsAPISeed');

async function seed() {
	const { error: deleteError } = await supabaseAdmin
		.from('products')
		.delete()
		.neq('id', 0);

	if (deleteError) throw deleteError;

	const { error: insertError } = await supabaseAdmin.from('products').insert(
		Object.values(PRODUCTS.products).map((product) => ({
			title: product.title,
			stock: product.stock,
			description: product.description,
			category: product.category,
			price: product.price,
			images: product.images,
			thumbnail: product.thumbnail,
		}))
	);

	if (insertError) throw insertError;

	console.log(`Seeded ${PRODUCTS.products.length} products.`);
}

seed().catch((error) => {
	console.error('Seeding failed:', error);
	process.exit(1);
});
