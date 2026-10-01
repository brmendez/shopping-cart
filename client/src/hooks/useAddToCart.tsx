import type { Product } from "../types";

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

export const useAddToCart = () => {

  const addToCart = async (product: Product) => {
      const res = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: getCartId(),
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error(`Add to cart failed: ${error}`);
      }
    };

  return {
    addToCart,
  }
};
