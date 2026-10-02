// Formats a number as US dollars, e.g. 12.5 -> "$12.50".
export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
