import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddToCart } from './hooks/useAddToCart';
import type { Product } from './types';

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

// Add to cart with every state: sold out, all in cart, adding, added, refused.
export const AddToCartButton = ({
  product,
  className,
}: AddToCartButtonProps) => {
  const { add, adding, added, refusedMessage, soldOut, allInCart, disabled } =
    useAddToCart(product);

  const label = soldOut
    ? 'Sold out'
    : allInCart
      ? 'All in your cart'
      : adding
        ? 'Adding'
        : refusedMessage
          ? refusedMessage
          : added
            ? 'Added'
            : 'Add to cart';

  return (
    <Button
      className={className}
      onClick={add}
      disabled={disabled}
      aria-busy={adding}
    >
      {adding && <Loader2 className="animate-spin" />}
      {added && !adding && <Check />}
      {label}
    </Button>
  );
};
