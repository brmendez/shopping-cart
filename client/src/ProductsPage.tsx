import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './hooks/useCart';
import { useCountdown } from './hooks/useCountdown';
import { useProducts } from './hooks/useProducts';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { ProductDetailSheet } from './ProductDetailSheet';

export const ProductsPage = () => {
  const { addToCart, loading, stockVersion } = useCart();

  const {
    products,
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
      <Hero restockIn={restockIn} scarce={scarce} onSelect={setSelectedId} />
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
