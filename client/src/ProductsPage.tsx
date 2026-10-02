import { useAddToCart } from './hooks/useAddToCart';
import { useProducts } from './hooks/useProducts';
import { ProductCard } from './ProductCard';

export const ProductsPage = () => {
  const { products, page, totalPages, nextPage, prevPage } = useProducts();

  const { addToCart } = useAddToCart();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={addToCart} />
        ))}
      </div>
      <button onClick={prevPage} disabled={page === 1}>
        Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={nextPage} disabled={page >= totalPages}>
        Next
      </button>
    </>
  );
};
