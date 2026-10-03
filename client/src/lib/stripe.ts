import { loadStripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Loads Stripe once for the whole app; null when no key is set.
export const stripePromise = PUBLISHABLE_KEY
  ? loadStripe(PUBLISHABLE_KEY)
  : null;
