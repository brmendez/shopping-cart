import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { API_URL } from '@/lib/api';
import type { Product, ProductsResponse } from '../types';

const PAGE_SIZE = 4;
// Wait a moment past the restock time so the database has finished restocking.
const RESTOCK_BUFFER_MS = 2000;
// Never reload more often than this, even if the restock time has already passed.
const MIN_RELOAD_DELAY_MS = 5000;
// After this long without products, tell the visitor the free server is waking up.
const SLOW_LOAD_MS = 4000;

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
  // First-load state. Later refreshes keep showing the old products if they fail.
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch(
          `${API_URL}/products?limit=${PAGE_SIZE}&page=${page}`
        );

        if (!res.ok) {
          throw new Error(`Products request failed: ${res.status}`);
        }

        const data: ProductsResponse = await res.json();

        setProducts(data.products);
        setTotal(data.total);
        setNextRestockAt(data.nextRestockAt);
        setScarce(data.scarce);
        setLoaded(true);
        setFailed(false);
      } catch {
        setFailed(true);
      }
    };

    getProducts();
  }, [page, refreshKey, restockTick, retryTick]);

  // Free hosting sleeps when idle, so a slow first load gets an explanation.
  useEffect(() => {
    if (loaded) {
      return;
    }

    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);

    return () => clearTimeout(timer);
  }, [loaded, retryTick]);

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

  const retry = () => {
    setFailed(false);
    setSlow(false);
    setRetryTick((t) => t + 1);
  };

  // 'loading' and 'error' only describe the first load; after that it's always 'ready'.
  const status: 'loading' | 'error' | 'ready' = loaded
    ? 'ready'
    : failed
      ? 'error'
      : 'loading';

  return {
    products,
    status,
    slow,
    retry,
    page,
    totalPages,
    total,
    nextRestockAt,
    scarce,
    nextPage: () => goToPage(Math.min(page + 1, totalPages)),
    prevPage: () => goToPage(Math.max(page - 1, 1)),
  };
};
