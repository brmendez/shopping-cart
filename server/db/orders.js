const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { stripe } = require('../lib/stripe');

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

// Saves a pending order (stock untouched), then a PaymentIntent for its DB-computed total.
async function createCheckoutSession(cartId) {
  const { error, data: orderId } = await supabaseAdmin.rpc('create_pending_order', {
    p_cart_id: cartId,
  });

  if (error) throw error;

  const order = await getOrder(orderId);

  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(Number(order.total) * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: String(order.id), cart_id: cartId },
    },
    { idempotencyKey: `order-${order.id}` }
  );

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', order.id);

  if (updateError) throw updateError;

  return { orderId: order.id, clientSecret: paymentIntent.client_secret, order };
}

module.exports = { checkout, getOrder, createCheckoutSession };
