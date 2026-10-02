import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './hooks/useCart';

export const Header = () => {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="text-lg font-semibold tracking-tight">
          Provisions
        </a>
        <Button
          variant="outline"
          className="h-10 rounded-full px-4"
          aria-label={`Cart, ${count} items`}
        >
          <ShoppingBag />
          <span className="tabular-nums">{count}</span>
        </Button>
      </div>
    </header>
  );
};
