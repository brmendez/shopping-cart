import { useEffect, useState, type ReactNode } from 'react';
import { CartContext } from './hooks/useCart';
import type { CartItem } from './types';

const API_URL = 'http://localhost:3001/api/cart';
const CART_ID_KEY = 'cartId';

// One random cart per browser until we have real users.
const getCartId = () => {
  let cartId = localStorage.getItem(CART_ID_KEY);

  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem(CART_ID_KEY, cartId);
  }

  return cartId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every cart endpoint answers with { cart } or { error }, so they share one request helper.
  const request = async (url: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      });
      const data: { cart: CartItem[]; error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      setCart(data.cart);
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  const itemUrl = (productId: number) => `${API_URL}/${getCartId()}/items/${productId}`;

  // Load whatever is already in this browser's cart.
  useEffect(() => {
    fetch(`${API_URL}/${getCartId()}`)
      .then((res) => res.json())
      .then((data: { cart: CartItem[] }) => setCart(data.cart))
      .catch(() => setError('Could not reach the server'));
  }, []);

  const addToCart = (productId: number) =>
    request(`${API_URL}/add`, {
      method: 'POST',
      body: JSON.stringify({ cartId: getCartId(), productId, quantity: 1 }),
    });

  const updateQuantity = (productId: number, quantity: number) =>
    request(itemUrl(productId), {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });

  const removeFromCart = (productId: number) =>
    request(itemUrl(productId), { method: 'DELETE' });

  return (
    <CartContext.Provider
      value={{ cart, loading, error, addToCart, updateQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
