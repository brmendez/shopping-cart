import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './hooks/useCart';
import { useCountdown } from './hooks/useCountdown';
import { useProducts } from './hooks/useProducts';
import { formatCountdown } from '@/lib/formatCountdown';
import { ProductCard } from './ProductCard';
import { ProductDetailSheet } from './ProductDetailSheet';

export const ProductsPage = () => {
  const { addToCart, loading, stockVersion } = useCart();

  const { products, page, totalPages, nextPage, prevPage, nextRestockAt } =
    useProducts(stockVersion);
  const restockIn = useCountdown(nextRestockAt);

  // Store the id, not the product, so the sheet always shows the latest loaded data.
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <section className="mt-6 flex flex-col gap-6 rounded-2xl bg-teal px-6 py-7 text-teal-foreground sm:mt-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-9">
        <h1 className="max-w-xl text-3xl leading-[1.05] font-semibold tracking-tighter sm:text-4xl">
          A little of everything, restocked every five minutes.
        </h1>
        {restockIn !== null && (
          <div className="sm:text-right">
            <p className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-80 sm:justify-end">
              <span className="size-1.5 rounded-full bg-teal-foreground motion-safe:animate-pulse" />
              {restockIn === 0 ? 'Restocking' : 'Next drop in'}
            </p>
            <p
              aria-live="off"
              className="mt-1 text-5xl leading-none font-semibold tracking-tighter tabular-nums sm:text-6xl"
            >
              {restockIn === 0 ? '…' : formatCountdown(restockIn)}
            </p>
          </div>
        )}
      </section>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-10 lg:grid-cols-4 lg:gap-x-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={addToCart}
            onSelect={setSelectedId}
            disabled={loading}
            restockIn={restockIn}
          />
        ))}
      </div>
      <nav
        aria-label="Pagination"
        className="mt-14 flex items-center justify-center gap-4"
      >
        <Button
          variant="outline"
          className="h-11 rounded-full px-4 sm:h-10"
          onClick={prevPage}
          disabled={page === 1}
        >
          <ChevronLeft />
          Prev
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          className="h-11 rounded-full px-4 sm:h-10"
          onClick={nextPage}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight />
        </Button>
      </nav>
      <ProductDetailSheet
        product={selectedProduct}
        onClose={() => setSelectedId(null)}
        restockIn={restockIn}
      />
    </>
  );
};
