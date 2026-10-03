import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/formatPrice';
import { formatCountdown } from '@/lib/formatCountdown';
import { getStockStatus } from '@/lib/stockStatus';
import { AddToCartButton } from './AddToCartButton';
import { useCart } from './hooks/useCart';
import { ProductGallery } from './ProductGallery';
import type { Product } from './types';

type ProductDetailSheetProps = {
  product: Product | null;
  onClose: () => void;
  // Seconds until the next restock, shown when sold out.
  restockIn: number | null;
};

// Slide-over with one product's details. Open whenever a product is passed in.
export const ProductDetailSheet = ({
  product,
  onClose,
  restockIn,
}: ProductDetailSheetProps) => {
  const { error } = useCart();

  // Keep the last product so the content stays put while the sheet slides out.
  const [shown, setShown] = useState<Product | null>(product);
  if (product && product !== shown) setShown(product);

  const status = shown ? getStockStatus(shown.stock) : 'in-stock';
  const soldOut = status === 'sold-out';

  return (
    <Sheet open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent showCloseButton className="w-full gap-0 p-0 sm:max-w-md">
        {shown && (
          <>
            <div className="flex-1 overflow-y-auto p-5 pt-14">
              <ProductGallery key={shown.id} product={shown} dimmed={soldOut} />
              <p className="mt-6 text-xs text-muted-foreground capitalize">
                {shown.category}
              </p>
              <div className="mt-1 flex items-start justify-between gap-4">
                <SheetTitle className="text-xl leading-snug font-semibold tracking-tight">
                  {shown.title}
                </SheetTitle>
                <p className="text-xl leading-snug font-semibold tabular-nums">
                  {formatPrice(shown.price)}
                </p>
              </div>
              {status === 'in-stock' && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {shown.stock} left
                </p>
              )}
              {status === 'low' && (
                <p className="mt-3 inline-block rounded-full bg-rose-soft px-2.5 py-1 text-xs font-medium text-rose-foreground">
                  Low stock — {shown.stock} left
                </p>
              )}
              {soldOut && (
                <p className="mt-3 inline-block rounded-full bg-rose-soft px-2.5 py-1 text-xs font-medium text-rose-foreground tabular-nums">
                  Sold out
                  {restockIn !== null && (
                    <>
                      {' · '}
                      {restockIn === 0
                        ? 'Restocking…'
                        : `Back in ${formatCountdown(restockIn)}`}
                    </>
                  )}
                </p>
              )}
              <SheetDescription className="mt-5 text-[15px] leading-relaxed">
                {shown.description}
              </SheetDescription>
            </div>
            <SheetFooter className="border-t px-5 py-5">
              {error && (
                <div
                  role="alert"
                  className="mb-2 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  {error}
                </div>
              )}
              <AddToCartButton
                product={shown}
                className="h-11 w-full rounded-full"
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
