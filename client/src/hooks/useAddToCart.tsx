import { useEffect, useRef, useState } from 'react';
import { getStockStatus } from '@/lib/stockStatus';
import type { Product } from '../types';
import { useCart } from './useCart';

// How long "Added" or a refusal stays on the button.
const FEEDBACK_MS = 1500;

// Everything one product's Add to cart button needs to know.
export const useAddToCart = (product: Product) => {
  const { cart, addToCart, loading, error } = useCart();
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<'added' | 'refused' | null>(null);
  const timer = useRef<number>(undefined);

  // Stop the feedback timer if the button goes away.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const inCart =
    cart.find((item) => item.product_id === product.id)?.quantity ?? 0;
  const soldOut = getStockStatus(product.stock) === 'sold-out';
  // The cart already holds every unit in stock, so another add would fail.
  const allInCart = !soldOut && inCart >= product.stock;

  const add = async () => {
    window.clearTimeout(timer.current);
    setResult(null);
    setAdding(true);

    const ok = await addToCart(product.id);

    setAdding(false);
    setResult(ok ? 'added' : 'refused');
    timer.current = window.setTimeout(() => setResult(null), FEEDBACK_MS);
  };

  return {
    add,
    adding,
    added: result === 'added',
    // The server's reason (e.g. "Only 3 left in stock") while the refusal is showing.
    refusedMessage: result === 'refused' ? (error ?? "Couldn't add") : null,
    soldOut,
    allInCart,
    disabled: loading || adding || soldOut || allInCart,
  };
};
