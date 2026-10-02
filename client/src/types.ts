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
