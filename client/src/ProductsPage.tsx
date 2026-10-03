import { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './hooks/useCart';
import { useCountdown } from './hooks/useCountdown';
import { useProducts } from './hooks/useProducts';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { ProductDetailSheet } from './ProductDetailSheet';

export const ProductsPage = () => {
  const { stockVersion } = useCart();

  const {
    products,
    status,
    slow,
    retry,
    page,
    totalPages,
    nextPage,
    prevPage,
    nextRestockAt,
    scarce,
  } = useProducts(stockVersion);
  const restockIn = useCountdown(nextRestockAt);

  // Store the id, not the product, so the sheet always shows the latest loaded data.
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Hero items may be on another page, so look in the scarce list too.
  const selectedProduct =
    [...products, ...scarce].find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <Hero
        restockIn={restockIn}
        scarce={scarce}
        onSelect={setSelectedId}
        status={status}
      />
      {status === 'ready' ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-10 lg:grid-cols-4 lg:gap-x-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={setSelectedId}
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
        </>
      ) : status === 'loading' ? (
        <div aria-busy="true">
          {slow && (
            <p
              role="status"
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-teal motion-safe:animate-pulse" />
              Waking up the server. Free hosting naps when idle, so this takes
              about 30 seconds.
            </p>
          )}
          <div
            aria-hidden="true"
            className={`${slow ? 'mt-6' : 'mt-8 sm:mt-10'} grid grid-cols-2 gap-x-4 gap-y-10 motion-safe:animate-pulse lg:grid-cols-4 lg:gap-x-6`}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <div className="aspect-square rounded-xl bg-muted" />
                <div className="mt-4 h-3 w-1/4 rounded-full bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded-full bg-muted" />
                <div className="mt-8 h-11 rounded-full bg-muted sm:h-10" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          role="alert"
          className="mt-8 flex flex-col items-center rounded-2xl bg-muted px-6 py-14 text-center sm:mt-10"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-background">
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight">
            Couldn&apos;t load the shop
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The server may still be starting. Give it a moment and try again.
          </p>
          <Button className="mt-6 h-11 rounded-full px-6" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
      <ProductDetailSheet
        product={selectedProduct}
        onClose={() => setSelectedId(null)}
        restockIn={restockIn}
      />
    </>
  );
};
