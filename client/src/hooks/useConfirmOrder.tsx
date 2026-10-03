import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/lib/api';
import { getCartId } from '@/lib/cartId';
import type { Order } from '../types';
import { useCart } from './useCart';

// Confirms the order with the server once (safe to repeat on refresh) and returns the result.
export const useConfirmOrder = (orderId: string | undefined) => {
  const { refreshCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Dev mode runs effects twice; one confirm per visit is enough.
  const started = useRef(false);

  useEffect(() => {
    if (!orderId || started.current) {
      return;
    }
    started.current = true;

    fetch(`${API_URL}/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId: getCartId() }),
    })
      .then(async (res) => {
        const data: { order?: Order; error?: string } = await res.json();

        if (!res.ok || !data.order) {
          setError(data.error ?? 'Could not load this order');
          return;
        }
        setOrder(data.order);

        // Paid or refunded, stock changed: reload the cart count and product list.
        refreshCart();
      })
      .catch(() => setError('Could not reach the server'));
  }, [orderId, refreshCart]);

  return { order, error };
};
