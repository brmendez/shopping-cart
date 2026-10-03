import { createContext, useContext } from 'react';
import type { CartItem } from '../types';

type CartContextValue = {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  stockVersion: number;
  // Resolves true when the item was added, so the button can confirm it.
  addToCart: (productId: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  refreshCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return cart;
};
