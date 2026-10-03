import { AddToCartButton } from './AddToCartButton';
import type { Product } from './types';
import { formatPrice } from '@/lib/formatPrice';
import { formatCountdown } from '@/lib/formatCountdown';
import { getStockStatus } from '@/lib/stockStatus';

type ProductProps = {
  product: Product;
  onSelect: (productId: number) => void;
  // Seconds until the next restock, shown on sold-out items.
  restockIn: number | null;
};

export const ProductCard = ({ product, onSelect, restockIn }: ProductProps) => {
  const status = getStockStatus(product.stock);
  const soldOut = status === 'sold-out';

  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(product.id)}
        aria-label={`View ${product.title}`}
        className="relative block aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {status !== 'in-stock' && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-soft px-2.5 py-1 text-xs font-medium whitespace-nowrap text-rose-foreground tabular-nums">
            {!soldOut && 'Low stock'}
            {soldOut && restockIn === null && 'Sold out'}
            {soldOut && restockIn !== null && (
              <>
                {/* On narrow cards the faded image and button already say sold out. */}
                <span className="hidden sm:inline">Sold out · </span>
                {restockIn === 0
                  ? 'Restocking…'
                  : `Back in ${formatCountdown(restockIn)}`}
              </>
            )}
          </span>
        )}
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className={`size-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none ${soldOut ? 'opacity-50' : ''}`}
        />
      </button>
      <p className="mt-4 text-xs text-muted-foreground capitalize">
        {product.category}
      </p>
      <div className="mt-1 mb-4 flex flex-1 items-start justify-between gap-3">
        <h2
          title={product.title}
          className="line-clamp-2 min-h-[2.75em] text-[15px] leading-snug font-medium"
        >
          <button
            type="button"
            onClick={() => onSelect(product.id)}
            className="cursor-pointer rounded-sm text-left outline-none decoration-1 underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.title}
          </button>
        </h2>
        <p className="text-[15px] leading-snug text-muted-foreground tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
      <AddToCartButton
        product={product}
        className="h-11 w-full rounded-full text-sm sm:h-10"
      />
    </article>
  );
};
