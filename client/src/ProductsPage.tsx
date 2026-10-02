import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';
import { ProductCard } from './ProductCard';

export const ProductsPage = () => {
  const { products, page, totalPages, nextPage, prevPage } = useProducts();

  const { addToCart, loading } = useCart();

  return (
    <>
      <div className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">
          Shop all
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A little of everything, restocked every five minutes.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={addToCart}
            disabled={loading}
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
  );
};
