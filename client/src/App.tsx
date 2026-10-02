import { CartProvider } from './cart.context';
import { Header } from './Header';
import { ProductsPage } from './ProductsPage';

const App = () => {
  return (
    <CartProvider>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <ProductsPage />
      </main>
    </CartProvider>
  );
};

export default App;
