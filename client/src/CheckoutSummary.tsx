// src/CheckoutSummary.tsx
import { useCart } from './hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';

// Read-only cart lines and subtotal.
export const CheckoutSummary = () => {
  const { cart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <div>
      <ul className="divide-y border-b">
        {cart.map((item) => (
          <li key={item.product_id} className="flex gap-4 py-5">
            <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={item.products.thumbnail}
                alt={item.products.title}
                className="size-full object-contain p-2"
              />
            </div>
            <div className="flex min-w-0 flex-1 justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] leading-snug font-medium">
                  {item.products.title}
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {item.quantity} × {formatPrice(item.products.price)}
                </p>
              </div>
              <p className="text-[15px] tabular-nums">
                {formatPrice(item.products.price * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-lg font-semibold tracking-tight">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
};
