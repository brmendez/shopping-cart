import { CartProvider } from './cart.context';
import { Header } from './Header';
import { ProductsPage } from './ProductsPage';
import { ShoppingCart } from './ShoppingCart';

const App = () => {
  return (
    <CartProvider>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <ProductsPage />
      </main>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="border-t py-10">
          <ShoppingCart />
        </div>
      </div>
    </CartProvider>
  );
};

export default App;
