import { formatCountdown } from '@/lib/formatCountdown';
import { getStockStatus } from '@/lib/stockStatus';
import type { Product } from './types';

const HERO_HEADLINE = 'A little of everything, restocked every two minutes.';

type HeroProps = {
  // Seconds until the next restock.
  restockIn: number | null;
  // Products that start tiny and sell out, shown as "Going fast".
  scarce: Product[];
};

// Top of the page: headline and restock countdown on the left, scarce items on the right.
export const Hero = ({ restockIn, scarce }: HeroProps) => {
  return (
    <section className="mt-6 grid overflow-hidden rounded-2xl bg-secondary sm:mt-8 sm:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-between gap-6 px-6 py-7 sm:px-10 sm:py-9">
        <h1 className="max-w-md text-2xl leading-[1.05] font-semibold tracking-tighter sm:text-3xl">
          {HERO_HEADLINE}
        </h1>
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
          {scarce.map((p) => (
            <li key={p.id}>
              <div className="aspect-square overflow-hidden rounded-lg bg-background">
                <img
                  src={p.thumbnail}
                  alt=""
                  className="size-full object-contain p-2"
                />
              </div>
              <p className="mt-1.5 truncate text-xs">{p.title}</p>
              <p className="text-xs text-rose-foreground">
                {getStockStatus(p.stock) === 'sold-out'
                  ? 'Sold out'
                  : `${p.stock} left`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
