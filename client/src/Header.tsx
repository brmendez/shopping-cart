import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from './hooks/useCart';
import { ShoppingCart } from './ShoppingCart';

export const Header = () => {
  const { cart, loading } = useCart();
  const { pathname } = useLocation();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Bump the count when a cart request finishes with more items. The first load is not a request.
  const [prev, setPrev] = useState({ count, loading });
  const [bumpKey, setBumpKey] = useState(0);

  if (prev.count !== count || prev.loading !== loading) {
    setPrev({ count, loading });

    if (prev.loading && !loading && count > prev.count) {
      setBumpKey((key) => key + 1);
    }
  }

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
              <span
                key={bumpKey}
                className={`inline-flex items-center gap-1.5 ${bumpKey > 0 ? 'motion-safe:animate-in motion-safe:zoom-in-125 motion-safe:duration-300' : ''}`}
              >
                <ShoppingBag />
                <span className="tabular-nums">{count}</span>
              </span>
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
