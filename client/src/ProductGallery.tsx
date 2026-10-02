import { useState } from 'react';
import type { Product } from './types';

type ProductGalleryProps = {
  product: Product;
  dimmed: boolean;
};

// Large image on a light tile, with a thumbnail strip when there are several images.
// Give it key={product.id} so the selection resets when the product changes.
export const ProductGallery = ({ product, dimmed }: ProductGalleryProps) => {
  const images =
    product.images.length > 0 ? product.images : [product.thumbnail];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={images[selected] ?? images[0]}
          alt={product.title}
          className={`size-full object-contain p-8 ${dimmed ? 'opacity-50' : ''}`}
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto p-0.5">
          {images.map((src, index) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === selected}
                className={`size-16 cursor-pointer overflow-hidden rounded-lg bg-muted outline-none transition-[box-shadow,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-ring ${
                  index === selected
                    ? 'ring-2 ring-foreground'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="size-full object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
