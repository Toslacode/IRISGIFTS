'use client';

import { useEffect, useRef, useState } from 'react';

import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { CategoryId } from '@/types';

/* ==========================================================================
   Product imagery, with a fallback that is designed rather than broken.

   Real photography goes in /public/products and /public/images. Until a file
   exists, this renders a warm tinted panel with the category mark — the page
   keeps its rhythm and nothing shows an alt-text box.
   ========================================================================== */

const CATEGORY_ICON: Record<CategoryId, IconName> = {
  towels: 'towel',
  robe: 'robe',
  skincare: 'cream',
  candles: 'candle',
  sweets: 'chocolate',
  wine: 'wine',
  homeware: 'cup',
  judaica: 'scroll',
  personalized: 'tag',
};

/* Each category gets its own quiet wash, so a grid reads as varied without
   becoming colourful. */
const CATEGORY_WASH: Record<CategoryId, string> = {
  towels: 'from-[#e6edf2] to-[#f6f1e8]',
  robe: 'from-[#f4e6e2] to-[#faf3ec]',
  skincare: 'from-[#e3efe9] to-[#f7f2e9]',
  candles: 'from-[#f2e7d5] to-[#faf4ea]',
  sweets: 'from-[#f1e2dc] to-[#f9f1e7]',
  wine: 'from-[#e8e2ee] to-[#f7f1e9]',
  homeware: 'from-[#e4ebe1] to-[#f8f3ea]',
  judaica: 'from-[#eee6d6] to-[#f9f4ea]',
  personalized: 'from-[#e9e5f0] to-[#f8f2e9]',
};

interface ProductImageProps {
  src: string;
  alt: string;
  category?: CategoryId;
  className?: string;
  /** Bigger mark for hero panels. */
  emphasis?: boolean;
  sizes?: string;
}

export function ProductImage({
  src,
  alt,
  category = 'personalized',
  className,
  emphasis = false,
  sizes,
}: ProductImageProps) {
  const [failed, setFailed] = useState(!src);
  const imgRef = useRef<HTMLImageElement>(null);

  /* An image that 404s before React hydrates has already fired its error
     event, and `onError` will never run — the card would keep a broken-image
     box forever. Re-check the element once on mount: `complete` with a zero
     `naturalWidth` is a load that failed. */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);


  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-linear-to-br',
          CATEGORY_WASH[category],
          className
        )}
      >
        {/* A single gold hairline arc keeps the panel from reading as empty */}
        <svg
          className="absolute inset-0 h-full w-full opacity-45"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="108"
            r="62"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="0.6"
          />
          <circle
            cx="100"
            cy="108"
            r="82"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="0.4"
            strokeDasharray="2 6"
          />
        </svg>
        <Icon
          name={CATEGORY_ICON[category]}
          size={emphasis ? 68 : 40}
          className="relative text-gold-deep/55"
          strokeWidth={1}
        />
      </div>
    );
  }

  return (
    /* Plain <img>: these are unoptimised placeholders today and real files
       later, and next/image would need width/height we don't have yet. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('media-tone object-cover', className)}
    />
  );
}
