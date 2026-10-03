const CART_ID_KEY = 'cartId';

// One random cart per browser until we have real users.
export const getCartId = () => {
  let cartId = localStorage.getItem(CART_ID_KEY);

  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem(CART_ID_KEY, cartId);
  }

  return cartId;
};
