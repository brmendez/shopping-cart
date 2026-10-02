import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from './types';

type ProductProps = {
  product: Product;
  onClick: (productId: number) => Promise<void>;
  disabled: boolean;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    price
  );

export const ProductCard = ({ product, onClick, disabled }: ProductProps) => {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    try {
      await onClick(product.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="size-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      </div>
      <div className="mt-4 mb-4 flex flex-1 items-start justify-between gap-3">
        <h2
          title={product.title}
          className="line-clamp-2 min-h-[2.75em] text-[15px] leading-snug font-medium"
        >
          {product.title}
        </h2>
        <p className="text-[15px] leading-snug text-muted-foreground tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
      <Button
        className="h-11 w-full rounded-full text-sm sm:h-10"
        onClick={handleClick}
        disabled={disabled}
        aria-busy={adding}
      >
        {adding && <Loader2 className="animate-spin" />}
        {adding ? 'Adding' : 'Add to cart'}
      </Button>
    </article>
  );
};
