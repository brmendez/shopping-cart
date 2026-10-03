// src/CheckoutPage.tsx
import { AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { CheckoutSummary } from './CheckoutSummary';
import { useCheckoutSession } from './hooks/useCheckoutSession';
import { PaymentForm } from './PaymentForm';
import { useCart } from './hooks/useCart';

export const CheckoutPage = () => {
  const { cart } = useCart();
  const { session, error } = useCheckoutSession(cart.length > 0);

  return (
    <div className="pt-8 sm:pt-12">
      <Link
        to="/"
        className="-ml-1 inline-flex items-center gap-1.5 rounded-sm px-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" />
        Back to shop
      </Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tighter sm:text-5xl">
        Checkout
      </h1>

      {cart.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-muted px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-background">
            <ShoppingBag className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add something from the shop to check out.
          </p>
          <Button
            className="mt-6 h-11 rounded-full px-6"
            render={<Link to="/" />}
            nativeButton={false}
          >
            Continue shopping
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
          <section aria-labelledby="summary-heading">
            <h2
              id="summary-heading"
              className="mb-2 text-lg font-semibold tracking-tight"
            >
              Order summary
            </h2>
            <CheckoutSummary />
          </section>
          <section
            aria-labelledby="payment-heading"
            className="self-start rounded-2xl bg-muted p-6 sm:p-8 lg:sticky lg:top-24"
          >
            <h2
              id="payment-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Payment
            </h2>
            <div className="mt-4 rounded-lg border border-dashed border-foreground/20 bg-background px-3.5 py-3 text-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Test mode
              </p>
              <p className="mt-1">
                Card{' '}
                <span className="font-mono font-medium tabular-nums">
                  4242 4242 4242 4242
                </span>
                , any future date, any CVC.
              </p>
            </div>
            <div className="mt-6">
              {error ? (
                <div role="alert" className="rounded-lg bg-background p-4">
                  <p className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 h-11 w-full rounded-full"
                    render={<Link to="/" />}
                    nativeButton={false}
                  >
                    Back to shop
                  </Button>
                </div>
              ) : session ? (
                <PaymentForm session={session} />
              ) : (
                <div
                  aria-busy="true"
                  aria-label="Loading payment"
                  className="space-y-3 motion-safe:animate-pulse"
                >
                  <div className="h-11 rounded-lg bg-background" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 rounded-lg bg-background" />
                    <div className="h-11 rounded-lg bg-background" />
                  </div>
                  <div className="h-11 rounded-full bg-foreground/10" />
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
