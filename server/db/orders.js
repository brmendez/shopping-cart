const { supabaseAdmin } = require('../lib/supabaseAdmin');

// Stock check, stock decrease, order + cart cleanup all happen in the checkout DB function.
async function checkout(cartId) {
  const { error, data: orderId } = await supabaseAdmin.rpc('checkout', {
    p_cart_id: cartId,
  });

  if (error) throw error;

  return getOrder(orderId);
}

async function getOrder(orderId) {
  const { error, data } = await supabaseAdmin
    .from('orders')
    .select(
      'id, total, status, created_at, order_items(product_id, title, unit_price, quantity)'
    )
    .eq('id', orderId)
    .single();

  if (error) throw error;

  return data;
}

module.exports = { checkout, getOrder };
