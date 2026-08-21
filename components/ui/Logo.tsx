import Link from 'next/link';

import { cn } from '@/lib/utils';

/* The wordmark. Hebrew has no italics and uppercase is a no-op, so the mark
   leans on weight contrast and a hairline rule instead. */
export function Logo({
  className,
  href = '/',
}: {
  className?: string;
  href?: string | null;
}) {
  const mark = (
    <span
      /* The wordmark is Latin, so it needs its own direction — inside an RTL
         document an inline-flex row renders "GIFTS IRIS". */
      dir="ltr"
      className={cn(
        'inline-flex items-baseline gap-[0.15em] font-display leading-none tracking-[0.14em]',
        className
      )}
    >
      <span className="text-[1.05rem] font-medium text-ink">IRIS</span>
      <span className="text-[1.05rem] font-light text-gold-deep">GIFTS</span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-sm transition-opacity duration-200 hover:opacity-70"
      aria-label="IRISGIFTS — לדף הבית"
    >
      {mark}
    </Link>
  );
}
