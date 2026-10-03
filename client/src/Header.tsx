import { ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from './hooks/useCart';
import { ShoppingCart } from './ShoppingCart';

export const Header = () => {
  const { cart } = useCart();
  const { pathname } = useLocation();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Provisions
        </Link>
        {/* Hidden while paying so the cart can't change. */}
        {pathname !== '/checkout' && (
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className="h-10 rounded-full px-4 hover:border-foreground/30"
                  aria-label={`Open cart, ${count} items`}
                />
              }
            >
              <ShoppingBag />
              <span className="tabular-nums">{count}</span>
            </SheetTrigger>
            <SheetContent
              showCloseButton
              className="w-full gap-0 p-0 sm:max-w-md"
            >
              <ShoppingCart />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};
