import {
  AlertCircle,
  Check,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from './hooks/useCart';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    price
  );

export const ShoppingCart = () => {
  const {
    cart,
    loading,
    error,
    order,
    updateQuantity,
    removeFromCart,
    checkout,
  } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <>
      <SheetHeader className="border-b px-5 py-4">
        <SheetTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {order ? 'Order placed' : 'Your cart'}
          {loading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </SheetTitle>
      </SheetHeader>

      {error && (
        <div
          role="alert"
          className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          {error}
        </div>
      )}

      {order ? (
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-5" />
          </div>
          <p className="mt-4 text-xl font-semibold tracking-tight">
            Thank you for your order
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Order #{order.id}
          </p>
          <ul className="mt-6 divide-y border-y text-sm">
            {order.order_items.map((item) => (
              <li
                key={item.product_id}
                className="flex justify-between gap-4 py-3"
              >
                <span>
                  {item.quantity} × {item.title}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </p>
        </div>
      ) : cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Things you add will show up here.
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y overflow-y-auto px-5">
          {cart.map((item) => (
            <li key={item.product_id} className="flex gap-4 py-5">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={item.products.thumbnail}
                  alt={item.products.title}
                  className="size-full object-contain p-2"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <p className="line-clamp-2 text-[15px] leading-snug font-medium">
                    {item.products.title}
                  </p>
                  <p className="text-[15px] leading-snug text-muted-foreground tabular-nums">
                    {formatPrice(item.products.price)}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 rounded-full"
                      aria-label={`Decrease quantity of ${item.products.title}`}
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      disabled={loading || item.quantity === 1}
                    >
                      <Minus />
                    </Button>
                    <span className="min-w-6 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 rounded-full"
                      aria-label={`Increase quantity of ${item.products.title}`}
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      disabled={loading}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    className="h-9 px-1 text-muted-foreground hover:text-foreground"
                    onClick={() => removeFromCart(item.product_id)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SheetFooter className="border-t px-5 py-5">
        {order ? (
          <SheetClose render={<Button className="h-11 w-full rounded-full" />}>
            Continue shopping
          </SheetClose>
        ) : (
          <>
            <p className="mb-2 flex justify-between text-base font-medium">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </p>
            <Button
              className="h-11 w-full rounded-full"
              onClick={checkout}
              disabled={loading || cart.length === 0}
            >
              {loading && cart.length > 0 && (
                <Loader2 className="animate-spin" />
              )}
              Checkout
            </Button>
          </>
        )}
      </SheetFooter>
    </>
  );
};
