import type { Product } from "../types";

export const useAddToCart = () => {

  const addToCart = async (product: Product) => {
      await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
    };

  return {
    addToCart,
  }
};
