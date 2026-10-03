import { useEffect, useState, type ReactNode } from 'react';
import { CartContext } from './hooks/useCart';
import { API_URL } from '@/lib/api';
import { getCartId } from '@/lib/cartId';
import type { CartItem } from './types';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Goes up whenever stock is known to have changed, so the product list can reload.
  const [stockVersion, setStockVersion] = useState(0);

  // Cart endpoints answer with { cart }, failures with { error }. Resolves true on success.
  const request = async (url: string, init?: RequestInit): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      });
      const data: { cart?: CartItem[]; error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');

        // 409 means stock moved under us (e.g. someone else bought it).
        if (res.status === 409) {
          setStockVersion((v) => v + 1);
        }
        return false;
      }

      if (data.cart) setCart(data.cart);
      return true;
    } catch {
      setError('Could not reach the server');
      return false;
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

  // Resync after payment: the server cart is emptied and stock has moved.
  const refreshCart = async () => {
    await request(`${API_URL}/cart/${getCartId()}`);
    setStockVersion((v) => v + 1);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        stockVersion,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
