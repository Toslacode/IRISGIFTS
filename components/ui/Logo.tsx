import Link from 'next/link';

import { cn } from '@/lib/utils';

/* ==========================================================================
   The brand lockup: the real mark, then the wordmark.

   The supplied logo is white-and-gold on solid black with no alpha, so it is
   served as a pre-built medallion (`npm run media` territory — see
   public/branding) with the black ground lifted to the site's ink navy and a
   circular mask applied. Dropping the raw PNG on the cream canvas would show
   a black square.
   ========================================================================== */

interface LogoProps {
  className?: string;
  href?: string | null;
  /** Hides the wordmark, leaving just the medallion. */
  markOnly?: boolean;
  /** Drops the Hebrew tagline on tight surfaces. */
  compact?: boolean;
  /** Over the opening film the wordmark has to go light to be readable. */
  onFilm?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({
  className,
  href = '/',
  markOnly = false,
  compact = false,
  onFilm = false,
  size = 'md',
}: LogoProps) {
  const mark = size === 'sm' ? 'size-9' : 'size-11';

  const lockup = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/iris-badge.png"
        alt=""
        width={512}
        height={512}
        className={cn(mark, 'shrink-0 rounded-full')}
      />

      {!markOnly && (
        <span className="flex flex-col leading-none">
          {/* The wordmark is Latin, so it needs its own direction — inside an
              RTL document an inline row renders "GIFTS IRIS". */}
          <span
            dir="ltr"
            className={cn(
              'font-display font-medium tracking-[0.18em]',
              onFilm ? 'text-media-text' : 'text-ink',
              size === 'sm' ? 'text-[0.9rem]' : 'text-[1.05rem]'
            )}
          >
            IRIS
          </span>
          {!compact && (
            <span
              className={cn(
                'mt-0.5 text-[0.6875rem] font-medium tracking-[0.01em]',
                onFilm ? 'text-media-muted' : 'text-ink-muted'
              )}
            >
              מתנות עם מחשבה
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return lockup;

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-sm transition-opacity duration-200 hover:opacity-70"
      aria-label="איריס מתנות — לדף הבית"
    >
      {lockup}
    </Link>
  );
}
