import { useState, type FormEvent } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatPrice';
import { stripePromise } from '@/lib/stripe';
import { stripeAppearance } from '@/lib/stripeAppearance';
import type { CheckoutSession } from './types';

type PaymentFormProps = {
  session: CheckoutSession;
};

// Stripe's card form for one pending order, themed to match the site.
export const PaymentForm = ({ session }: PaymentFormProps) => {
  if (!stripePromise) {
    return (
      <p className="text-sm text-muted-foreground">
        VITE_STRIPE_PUBLISHABLE_KEY is not set.
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: session.clientSecret,
        appearance: stripeAppearance,
      }}
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
      <PaymentElement
        options={{ layout: { type: 'tabs', defaultCollapsed: false } }}
      />
      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg bg-background px-3 py-2.5 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="mt-6 h-11 w-full rounded-full"
        disabled={!stripe || paying}
        aria-busy={paying}
      >
        {paying && <Loader2 className="animate-spin" />}
        {paying ? 'Paying…' : `Pay ${formatPrice(session.order.total)}`}
      </Button>
    </form>
  );
};
