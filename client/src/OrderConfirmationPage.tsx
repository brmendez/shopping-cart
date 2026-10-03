import type { ReactNode } from 'react';
import { AlertCircle, Check, Loader2, Undo2 } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatPrice';
import { useConfirmOrder } from './hooks/useConfirmOrder';
import type { Order } from './types';

const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

// Narrow centered column shared by every state.
const Shell = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto max-w-xl pt-10 pb-4 sm:pt-16">{children}</div>
);

const BackToShop = ({ label }: { label: string }) => (
  <Button
    className="h-11 w-full rounded-full"
    render={<Link to="/" />}
    nativeButton={false}
  >
    {label}
  </Button>
);

// Read-only item rows and total, in the same style as the checkout summary.
const OrderItems = ({ order }: { order: Order }) => (
  <div className="mt-8">
    <ul className="divide-y border-y">
      {order.order_items.map((item) => (
        <li
          key={item.product_id}
          className="flex justify-between gap-4 py-4 text-[15px]"
        >
          <div className="min-w-0">
            <p className="line-clamp-2 leading-snug font-medium">
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {item.quantity} × {formatPrice(item.unit_price)}
            </p>
          </div>
          <p className="tabular-nums">
            {formatPrice(item.unit_price * item.quantity)}
          </p>
        </li>
      ))}
    </ul>
    <p className="mt-4 flex justify-between text-lg font-semibold tracking-tight">
      <span>Total</span>
      <span className="tabular-nums">{formatPrice(order.total)}</span>
    </p>
  </div>
);

// Shows the outcome of a payment.
export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { order, error, paymentIncomplete } = useConfirmOrder(orderId);

  if (error) {
    return (
      <Shell>
        <div role="alert" className="rounded-2xl bg-muted p-6 sm:p-8">
          <div className="flex size-10 items-center justify-center rounded-full bg-background">
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            We couldn't confirm this order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            {paymentIncomplete && (
              <Button
                className="h-11 w-full rounded-full"
                render={<Link to="/checkout" />}
                nativeButton={false}
              >
                Back to checkout
              </Button>
            )}
            <Button
              variant="outline"
              className="h-11 w-full rounded-full bg-background hover:bg-background/60"
              render={<Link to="/" />}
              nativeButton={false}
            >
              Back to shop
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell>
        <div
          aria-busy="true"
          className="flex flex-col items-center rounded-2xl bg-muted px-6 py-16 text-center"
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
          <p className="mt-4 text-lg font-semibold tracking-tight">
            Confirming your order…
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This only takes a moment.
          </p>
        </div>
      </Shell>
    );
  }

  if (order.status === 'refunded') {
    return (
      <Shell>
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-soft text-rose-foreground">
          <Undo2 className="size-5" />
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tighter sm:text-5xl">
          Sold out while you were paying
        </h1>
        <p className="mt-3 text-[15px]">Your payment was refunded in full.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Order #{order.id} · {formatOrderDate(order.created_at)}
        </p>
        <OrderItems order={order} />
        <div className="mt-8">
          <BackToShop label="Back to shop" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-6" />
      </div>
      <h1 className="mt-5 text-4xl font-semibold tracking-tighter sm:text-5xl">
        Thank you
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order #{order.id} · {formatOrderDate(order.created_at)}
      </p>
      <OrderItems order={order} />
      <div className="mt-8">
        <BackToShop label="Continue shopping" />
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        This was a test-mode order. No real charge was made.
      </p>
    </Shell>
  );
};
