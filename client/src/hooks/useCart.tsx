import { createContext, useContext } from 'react';
import type { CartItem } from '../types';

type CartContextValue = {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  stockVersion: number;
  addToCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
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
