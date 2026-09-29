import type { Product } from './types';

type ProductProps = {
  product: Product;
  onClick: (p: Product) => void;
};

export const ProductCard = ({ product, onClick }: ProductProps) => {
  return (
    <div className="bg-gray-100 p-4" key={product.id}>
      {product.title}
      {/*Stock: {product.stock < 8 ? `Low Stock! ${product.stock}` : product.stock}*/}
      <img src={product.thumbnail} alt={product.title} />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => onClick(product)}
      >
        Add to cart
      </button>
    </div>
  );
};
