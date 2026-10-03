const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { stripe } = require('../lib/stripe');

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

// Null for a missing order or one owned by another cart, so callers can't tell which.
async function getOrderForCart(orderId, cartId) {
  const { error, data } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('cart_id', cartId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return null;
  }

  return getOrder(orderId);
}

// Returns { order } on success or { status, body } for an HTTP error the route should send.
async function confirmOrder(orderId, cartId) {
  const { error, data: row } = await supabaseAdmin
    .from('orders')
    .select('id, cart_id, status, total, stripe_payment_intent_id')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;

  // Postgres returns UUIDs lowercase; the pattern accepts any case.
  if (!row || row.cart_id !== cartId.toLowerCase()) {
    return { status: 404, body: { error: 'Order not found' } };
  }

  // Already settled: confirming again is a no-op.
  if (row.status === 'paid' || row.status === 'refunded') {
    return { order: await getOrder(row.id) };
  }

  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!row.stripe_payment_intent_id) {
    return {
      status: 409,
      body: { error: 'Payment not completed', paymentStatus: 'none' },
    };
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id);

  if (paymentIntent.status !== 'succeeded') {
    return {
      status: 409,
      body: { error: 'Payment not completed', paymentStatus: paymentIntent.status },
    };
  }

  // Never trust the client: the payment must be for this order and its DB total.
  if (
    paymentIntent.amount !== Math.round(Number(row.total) * 100) ||
    paymentIntent.metadata?.order_id !== String(row.id)
  ) {
    console.error(
      `PaymentIntent ${paymentIntent.id} does not match order ${row.id}`
    );

    return { status: 409, body: { error: 'Payment does not match this order' } };
  }

  const { error: finalizeError, data: result } = await supabaseAdmin.rpc(
    'finalize_order',
    { p_order_id: row.id }
  );

  if (finalizeError) throw finalizeError;

  if (result !== 'out_of_stock') {
    return { order: await getOrder(row.id) };
  }

  // Customer paid but stock ran out: give the money back.
  try {
    await stripe.refunds.create(
      { payment_intent: paymentIntent.id },
      { idempotencyKey: `refund-order-${row.id}` }
    );
  } catch (refundErr) {
    console.error(`Refund failed for PaymentIntent ${paymentIntent.id}`, refundErr);

    return {
      status: 500,
      body: {
        error: `Payment received but the order failed. Reference: ${paymentIntent.id}`,
      },
    };
  }

  const { error: refundedError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', row.id)
    .eq('status', 'pending');

  if (refundedError) throw refundedError;

  return { order: await getOrder(row.id) };
}

module.exports = {
  getOrder,
  createCheckoutSession,
  getOrderForCart,
  confirmOrder,
};
