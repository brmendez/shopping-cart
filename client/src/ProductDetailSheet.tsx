import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getStockStatus } from '@/lib/stockStatus';
import { useCart } from './hooks/useCart';
import type { Product } from './types';

type ProductDetailSheetProps = {
  product: Product | null;
  onClose: () => void;
};

// Slide-over with one product's details. Open whenever a product is passed in.
export const ProductDetailSheet = ({
  product,
  onClose,
}: ProductDetailSheetProps) => {
  const { addToCart, loading } = useCart();

  const soldOut = product
    ? getStockStatus(product.stock) === 'sold-out'
    : false;

  return (
    <Sheet open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent showCloseButton className="w-full sm:max-w-md">
        {product && (
          <>
            <SheetHeader>
              <SheetTitle>{product.title}</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <Button
                onClick={() => addToCart(product.id)}
                disabled={loading || soldOut}
              >
                {soldOut ? 'Sold out' : 'Add to cart'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
