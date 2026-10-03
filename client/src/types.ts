export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
  images: string[];
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  limit: number;
  page: number;
  nextRestockAt: string;
  // Products that start tiny and sell out, featured in the hero.
  scarce: Product[];
};

export type CartItem = {
  product_id: number;
  quantity: number;
  products: Pick<Product, 'title' | 'price' | 'thumbnail'>;
};

export type Order = {
  id: number;
  total: number;
  status: 'pending' | 'paid';
  created_at: string;
  order_items: {
    product_id: number;
    title: string;
    unit_price: number;
    quantity: number;
  }[];
};

// What the server returns when checkout starts: a pending order and its Stripe payment.
export type CheckoutSession = {
  orderId: number;
  clientSecret: string;
  order: Order;
};
