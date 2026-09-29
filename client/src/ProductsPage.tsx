import { useAddToCart } from './hooks/useAddToCart';
import { useProducts } from './hooks/useProducts';
import { ProductCard } from './ProductCard';

import type { Product } from './types';

export const ProductsPage = () => {
  const { products } = useProducts();

  const { addToCart } = useAddToCart();

  const handleClick = (p: Product) => {
    addToCart(p);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.values(products).map((p) => (
        <ProductCard key={p.id} product={p} onClick={handleClick} />
      ))}
    </div>
  );
};
