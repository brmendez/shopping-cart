export const LOW_STOCK_THRESHOLD = 3;

export type StockStatus = 'sold-out' | 'low' | 'in-stock';

// Turns a stock count into the label the UI shows.
export const getStockStatus = (stock: number): StockStatus => {
  if (stock <= 0) return 'sold-out';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low';

  return 'in-stock';
};
