import { useCart } from './hooks/useCart';

export const ShoppingCart = () => {
  const { cart, loading, error, updateQuantity, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.products.price * item.quantity, 0);

  return (
    <div>
      <h2>Cart</h2>
      {error && <p>{error}</p>}
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.product_id}>
              {item.products.title} ${item.products.price}
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                disabled={loading || item.quantity === 1}
              >
                −
              </button>
              {item.quantity}
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                disabled={loading}
              >
                +
              </button>
              <button onClick={() => removeFromCart(item.product_id)} disabled={loading}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
};
