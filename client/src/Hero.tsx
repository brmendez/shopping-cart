import { formatCountdown } from '@/lib/formatCountdown';
import { getStockStatus } from '@/lib/stockStatus';
import type { Product } from './types';

const HERO_HEADLINE = 'A little of everything, restocked every two minutes.';

type HeroProps = {
  // Seconds until the next restock.
  restockIn: number | null;
  // Products that start tiny and sell out, shown as "Going fast".
  scarce: Product[];
  // Opens a product's detail sheet.
  onSelect: (productId: number) => void;
  // Until products arrive, show quiet placeholders instead of empty space.
  status: 'loading' | 'error' | 'ready';
};

// Top of the page: headline and restock countdown on the left, scarce items on the right.
export const Hero = ({ restockIn, scarce, onSelect, status }: HeroProps) => {
  const pending = status !== 'ready';
  const pulse = status === 'loading' ? 'motion-safe:animate-pulse' : '';

  return (
    <section className="mt-6 grid overflow-hidden rounded-2xl bg-secondary sm:mt-8 sm:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-between gap-6 px-6 py-7 sm:px-10 sm:py-9">
        <h1 className="max-w-md text-2xl leading-[1.05] font-semibold tracking-tighter sm:text-3xl">
          {HERO_HEADLINE}
        </h1>
        {restockIn === null && pending && (
          <div
            aria-hidden="true"
            className={`flex items-center gap-4 ${pulse}`}
          >
            <div className="h-[3.25rem] w-28 rounded-xl bg-foreground/10" />
            <div className="h-3 w-28 rounded-full bg-foreground/10" />
          </div>
        )}
        {restockIn !== null && (
          <div className="flex items-center gap-4">
            <p
              aria-live="off"
              className="rounded-xl bg-teal px-4 py-2 text-4xl leading-none font-semibold tracking-tighter text-teal-foreground tabular-nums"
            >
              {restockIn === 0 ? '…' : formatCountdown(restockIn)}
            </p>
            <p className="flex items-center gap-2 text-sm font-medium text-teal">
              <span className="size-1.5 rounded-full bg-teal motion-safe:animate-pulse" />
              {restockIn === 0 ? 'Restocking' : 'until the next drop'}
            </p>
          </div>
        )}
      </div>
      <div className="px-6 pb-7 sm:py-9 sm:pr-10 sm:pl-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Going fast
        </p>
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {scarce.length === 0 &&
            pending &&
            Array.from({ length: 4 }, (_, i) => (
              <li key={i} aria-hidden="true" className={pulse}>
                <div className="aspect-square rounded-lg bg-background" />
                <div className="mt-1.5 h-3 w-4/5 rounded-full bg-foreground/10" />
                <div className="mt-1 h-3 w-1/2 rounded-full bg-foreground/10" />
              </li>
            ))}
          {scarce.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                aria-label={`View ${p.title}`}
                className="group/item block w-full cursor-pointer rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-background">
                  <img
                    src={p.thumbnail}
                    alt=""
                    className="size-full object-contain p-2 transition-transform duration-300 ease-out group-hover/item:scale-[1.06] motion-reduce:transition-none"
                  />
                </div>
                <p className="mt-1.5 truncate text-xs underline-offset-4 group-hover/item:underline">
                  {p.title}
                </p>
                <p className="text-xs text-rose-foreground">
                  {getStockStatus(p.stock) === 'sold-out'
                    ? 'Sold out'
                    : `${p.stock} left`}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
