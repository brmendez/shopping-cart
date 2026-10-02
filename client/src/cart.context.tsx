import { useEffect, useState, type ReactNode } from 'react';
import { CartContext } from './hooks/useCart';
import type { CartItem, Order } from './types';

const API_URL = 'http://localhost:3001/api';
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
  const [order, setOrder] = useState<Order | null>(null);

  // Cart endpoints answer with { cart }, checkout with { order }, failures with { error }.
  const request = async (url: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      });
      const data: { cart?: CartItem[]; order?: Order; error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      if (data.cart) setCart(data.cart);

      // A finished checkout empties the cart on the server.
      if (data.order) {
        setOrder(data.order);
        setCart([]);
      }
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  const itemUrl = (productId: number) => `${API_URL}/cart/${getCartId()}/items/${productId}`;

  // Load whatever is already in this browser's cart.
  useEffect(() => {
    fetch(`${API_URL}/cart/${getCartId()}`)
      .then((res) => res.json())
      .then((data: { cart: CartItem[] }) => setCart(data.cart))
      .catch(() => setError('Could not reach the server'));
  }, []);

  const addToCart = (productId: number) =>
    request(`${API_URL}/cart/add`, {
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

  const checkout = () =>
    request(`${API_URL}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ cartId: getCartId() }),
    });

  return (
    <CartContext.Provider
      value={{ cart, loading, error, order, addToCart, updateQuantity, removeFromCart, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
};
