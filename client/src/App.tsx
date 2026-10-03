import { BrowserRouter, Route, Routes } from 'react-router';
import { CartProvider } from './cart.context';
import { CheckoutPage } from './CheckoutPage';
import { Header } from './Header';
import { OrderConfirmationPage } from './OrderConfirmationPage';
import { ProductsPage } from './ProductsPage';

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderConfirmationPage />} />
          </Routes>
        </main>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
