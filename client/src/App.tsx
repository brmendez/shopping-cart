import { CartProvider } from './cart.context'
import { ProductsPage } from './ProductsPage'
import { ShoppingCart } from './ShoppingCart'
import './App.css'

function App() {
  return (
    <CartProvider>
      <ProductsPage/>
      <ShoppingCart/>
    </CartProvider>
  )
}

export default App
