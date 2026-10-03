import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getCartId } from '@/lib/cartId';
import type { CheckoutSession } from '../types';

// Starts checkout once the cart has items: creates a pending order and its Stripe payment.
export const useCheckoutSession = (hasItems: boolean) => {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Dev mode runs effects twice; this keeps it to one order per visit.
  const started = useRef(false);

  useEffect(() => {
    if (!hasItems || started.current) {
      return;
    }
    started.current = true;

    fetch(`${API_URL}/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId: getCartId() }),
    })
      .then(async (res) => {
        const data: CheckoutSession & { error?: string } = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Could not start checkout');
          return;
        }
        setSession(data);
      })
      .catch(() => setError('Could not reach the server'));
  }, [hasItems]);

  return { session, error };
};
