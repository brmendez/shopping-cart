import { useState, type FormEvent } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatPrice';
import { stripePromise } from '@/lib/stripe';
import type { CheckoutSession } from './types';

type PaymentFormProps = {
  session: CheckoutSession;
};

// Stripe's card form for one pending order. Plain for now; styled in a later ticket.
export const PaymentForm = ({ session }: PaymentFormProps) => {
  if (!stripePromise) {
    return <p>VITE_STRIPE_PUBLISHABLE_KEY is not set.</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: session.clientSecret }}
    >
      <PayButtonForm session={session} />
    </Elements>
  );
};

// Lives inside <Elements> so it can reach Stripe.
const PayButtonForm = ({ session }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setPaying(true);
    setError(null);

    const orderUrl = `/order/${session.orderId}`;
    // Cards that need a bank check redirect to the order page; the rest come straight back here.
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${orderUrl}` },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
      setPaying(false);
      return;
    }

    navigate(orderUrl);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={!stripe || paying}>
        {paying ? 'Paying…' : `Pay ${formatPrice(session.order.total)}`}
      </Button>
    </form>
  );
};
