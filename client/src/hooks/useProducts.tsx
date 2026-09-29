import { useState, useEffect } from 'react';
import type { Product, ProductsResponse } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  // const [limit, setLimit] = useState(0);
  // const [skip, setSkip] = useState(0);
  // const [total, setTotal] = useState(0);

  useEffect(() => {
    const getProducts = async () => {
      const p = await fetch(
        'http://localhost:3001/api/products?limit=4&page=2'
      );
      const { products }: ProductsResponse = await p.json();

      setProducts(products);
      // setLimit(limit);
      // setSkip(skip);
      // setTotal(total);
    };

    getProducts();
  }, []);

  return {
    products,
    // limit,
    // skip,
    // total,
  };
};
