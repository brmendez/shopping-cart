import { useAddToCart } from './hooks/useAddToCart';
import { useProducts } from './hooks/useProducts';
import { ProductCard } from './ProductCard';

export const ProductsPage = () => {
  const { products } = useProducts();

  const { addToCart } = useAddToCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onClick={addToCart} />
      ))}
    </div>
  );
};
