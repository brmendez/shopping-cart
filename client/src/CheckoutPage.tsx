// src/CheckoutPage.tsx
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { CheckoutSummary } from './CheckoutSummary';
import { useCart } from './hooks/useCart';

export const CheckoutPage = () => {
  const { cart } = useCart();

  return (
    <div className="mx-auto max-w-2xl pt-10">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back to shop
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">Checkout</h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button render={<Link to="/" />} nativeButton={false}>
            Continue shopping
          </Button>
        </div>
      ) : (
        <>
          <CheckoutSummary />
          {/* Payment form goes here. */}
        </>
      )}
    </div>
  );
};
