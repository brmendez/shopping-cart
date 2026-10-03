import { useParams } from 'react-router';

// Placeholder until the confirmation page is wired up.
export const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  return <h1 className="pt-10 text-2xl font-semibold">Order #{orderId}</h1>;
};
