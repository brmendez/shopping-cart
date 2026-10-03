const Stripe = require('stripe');

// Stripe throws on a missing key, so stay null and let callers fail with a clear error.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

module.exports = { stripe };
