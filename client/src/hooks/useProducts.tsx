import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { API_URL } from '@/lib/api';
import type { Product, ProductsResponse } from '../types';

const PAGE_SIZE = 4;
// Wait a moment past the restock time so the database has finished restocking.
const RESTOCK_BUFFER_MS = 2000;
// Never reload more often than this, even if the restock time has already passed.
const MIN_RELOAD_DELAY_MS = 5000;

// refreshKey: change it to reload the current page (e.g. after stock changes).
export const useProducts = (refreshKey: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  // The page lives in the URL (?page=N), so refresh, links and back/forward all work.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [total, setTotal] = useState(0);
  const [nextRestockAt, setNextRestockAt] = useState<string | null>(null);
  const [scarce, setScarce] = useState<Product[]>([]);
  const [restockTick, setRestockTick] = useState(0);

  useEffect(() => {
    const getProducts = async () => {
      const res = await fetch(
        `${API_URL}/products?limit=${PAGE_SIZE}&page=${page}`
      );
      const data: ProductsResponse = await res.json();

      setProducts(data.products);
      setTotal(data.total);
      setNextRestockAt(data.nextRestockAt);
      setScarce(data.scarce);
    };

    getProducts();
  }, [page, refreshKey, restockTick]);

  // Reload once the next restock lands, so sold-out items come back on their own.
  useEffect(() => {
    if (!nextRestockAt) {
      return;
    }

    const delay = Math.max(
      new Date(nextRestockAt).getTime() - Date.now() + RESTOCK_BUFFER_MS,
      MIN_RELOAD_DELAY_MS
    );
    const timer = setTimeout(() => setRestockTick((t) => t + 1), delay);

    return () => clearTimeout(timer);
  }, [nextRestockAt]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = (next: number) => setSearchParams({ page: String(next) });

  return {
    products,
    page,
    totalPages,
    total,
    nextRestockAt,
    scarce,
    nextPage: () => goToPage(Math.min(page + 1, totalPages)),
    prevPage: () => goToPage(Math.max(page - 1, 1)),
  };
};
