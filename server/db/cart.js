const { supabaseAdmin } = require('../lib/supabaseAdmin');

// Stock check + upsert happen together in the add_to_cart DB function.
async function addToCart(cartId, productId, quantity) {
  const { error } = await supabaseAdmin.rpc('add_to_cart', {
    p_cart_id: cartId,
    p_product_id: productId,
    p_quantity: quantity,
  });

  if (error) throw error;

  return getCart(cartId);
}

async function setQuantity(cartId, productId, quantity) {
  const { error } = await supabaseAdmin.rpc('set_cart_quantity', {
    p_cart_id: cartId,
    p_product_id: productId,
    p_quantity: quantity,
  });

  if (error) throw error;

  return getCart(cartId);
}

async function removeFromCart(cartId, productId) {
  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('product_id', productId);

  if (error) throw error;

  return getCart(cartId);
}

async function getCart(cartId) {
  const { error, data } = await supabaseAdmin
    .from('cart_items')
    .select('product_id, quantity, products(title, price, thumbnail)')
    .eq('cart_id', cartId)
    .order('created_at');

  if (error) throw error;

  return data;
}

module.exports = { addToCart, setQuantity, removeFromCart, getCart };
