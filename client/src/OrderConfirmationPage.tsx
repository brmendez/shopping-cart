import { Link, useParams } from 'react-router';
import { formatPrice } from '@/lib/formatPrice';
import { useConfirmOrder } from './hooks/useConfirmOrder';

// Shows the outcome of a payment. Plain for now; styled in a later ticket.
export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { order, error } = useConfirmOrder(orderId);

  if (error) {
    return (
      <div className="pt-10">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p>{error}</p>
        <Link to="/">Back to shop</Link>
      </div>
    );
  }

  if (!order) {
    return <p className="pt-10">Confirming your order…</p>;
  }

  return (
    <div className="pt-10">
      {order.status === 'refunded' ? (
        <>
          <h1 className="text-2xl font-semibold">
            Sold out while you were paying
          </h1>
          <p>Your payment was refunded in full.</p>
        </>
      ) : (
        <h1 className="text-2xl font-semibold">Thank you, order #{order.id}</h1>
      )}
      <ul>
        {order.order_items.map((item) => (
          <li key={item.product_id}>
            {item.quantity} × {item.title} —{' '}
            {formatPrice(item.unit_price * item.quantity)}
          </li>
        ))}
      </ul>
      <p>Total: {formatPrice(order.total)}</p>
      <Link to="/">Continue shopping</Link>
    </div>
  );
};
