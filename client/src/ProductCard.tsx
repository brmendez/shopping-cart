import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from './types';
import { formatPrice } from '@/lib/formatPrice';
import { getStockStatus } from '@/lib/stockStatus';

type ProductProps = {
  product: Product;
  onClick: (productId: number) => Promise<void>;
  disabled: boolean;
};

export const ProductCard = ({ product, onClick, disabled }: ProductProps) => {
  const [adding, setAdding] = useState(false);
  const status = getStockStatus(product.stock);
  const soldOut = status === 'sold-out';

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
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {status !== 'in-stock' && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-soft px-2.5 py-1 text-xs font-medium text-rose-foreground">
            {soldOut ? 'Sold out' : 'Low stock'}
          </span>
        )}
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className={`size-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none ${soldOut ? 'opacity-50' : ''}`}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground capitalize">
        {product.category}
      </p>
      <div className="mt-1 mb-4 flex flex-1 items-start justify-between gap-3">
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
        disabled={disabled || soldOut}
        aria-busy={adding}
      >
        {adding && <Loader2 className="animate-spin" />}
        {soldOut ? 'Sold out' : adding ? 'Adding' : 'Add to cart'}
      </Button>
    </article>
  );
};
