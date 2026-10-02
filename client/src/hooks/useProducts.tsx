import { useState, useEffect } from 'react';
import type { Product, ProductsResponse } from '../types';

const PAGE_SIZE = 4;
// Wait a moment past the restock time so the database has finished restocking.
const RESTOCK_BUFFER_MS = 2000;
// Never reload more often than this, even if the restock time has already passed.
const MIN_RELOAD_DELAY_MS = 5000;

// Reads ?page= from the URL, falling back to 1.
const getPageFromUrl = () =>
  Math.max(1, Number(new URLSearchParams(window.location.search).get('page')) || 1);

// refreshKey: change it to reload the current page (e.g. after stock changes).
export const useProducts = (refreshKey: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(getPageFromUrl);
  const [total, setTotal] = useState(0);
  const [nextRestockAt, setNextRestockAt] = useState<string | null>(null);
  const [restockTick, setRestockTick] = useState(0);

  // Keeps the URL in sync so refresh and shared links land on the same page.
  useEffect(() => {
    if (getPageFromUrl() !== page) {
      window.history.pushState(null, '', `?page=${page}`);
    }
  }, [page]);

  // Back/forward buttons change the URL, so follow it.
  useEffect(() => {
    const onPopState = () => setPage(getPageFromUrl());

    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      const res = await fetch(
        `http://localhost:3001/api/products?limit=${PAGE_SIZE}&page=${page}`
      );
      const data: ProductsResponse = await res.json();

      setProducts(data.products);
      setTotal(data.total);
      setNextRestockAt(data.nextRestockAt);
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

  return {
    products,
    page,
    totalPages,
    total,
    nextRestockAt,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
};
