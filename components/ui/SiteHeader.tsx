'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

/* ==========================================================================
   The shop's navigation.

   A boutique bar, not an application chrome: the mark, a quiet row of links,
   and one champagne action. Over the opening film it is transparent with
   light type; the moment the film is behind you it becomes a pane of warm
   glass over whatever is scrolling underneath.

   Phones get a drawer rather than a squeezed row — six links do not fit a
   390px bar without becoming a scroll of their own.
   ========================================================================== */

const links = [
  { href: '/#opening', label: 'ראשי' },
  { href: '/baskets', label: 'מארזים' },
  { href: '/#builder', label: 'בניית מארז' },
  { href: '/#about', label: 'אודותינו' },
  { href: '/#delivery', label: 'משלוחים' },
  { href: '/#visit', label: 'צור קשר' },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* A drawer that survives a route change is a trap. */
  useEffect(() => setOpen(false), [pathname]);

  /* Escape closes it, and the page behind it does not scroll under it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Over the film the bar has no ground of its own and the type goes light. */
  const onFilm = transparent && !scrolled && !open;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-(--nav-h)',
        'transition-[background-color,border-color,box-shadow] duration-400 ease-out-soft',
        /* No rule over the film: a hairline across the footage reads as the
           edge of a pasted-in box, which is the one thing this opening is
           not allowed to look like. */
        onFilm
          ? 'border-b border-transparent bg-transparent'
          : 'glass-panel border-b border-gold-soft/60 bg-canvas/82 shadow-soft'
      )}
    >
      <div className="shell flex h-full items-center justify-between gap-4">
        {/* The mark reads white-on-film and ink-on-cream; the wordmark colour
            is what has to change, so it is handed the state. */}
        <Logo onFilm={onFilm} compact />

        <nav aria-label="ניווט ראשי" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center rounded-pill px-3.5 text-[0.9375rem]',
                    'transition-[color,background-color] duration-200',
                    onFilm
                      ? 'text-media-muted hover:bg-white/10 hover:text-media-text'
                      : 'text-ink-soft hover:bg-gold-wash hover:text-ink'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Wrapped rather than given `hidden` directly: the button already
              sets its own display, and this project's `cn` is a plain join —
              two display utilities on one element is a coin toss. */}
          <span className="hidden sm:block">
            <ButtonLink href="/#builder" size="sm">
              בניית מארז
            </ButtonLink>
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center rounded-pill lg:hidden',
              'transition-[background-color,color] duration-200',
              onFilm
                ? 'text-media-text hover:bg-white/10'
                : 'text-ink hover:bg-gold-wash'
            )}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* The drawer. Rendered always so it can animate, and taken out of the
          accessibility tree and the tab order while it is shut. */}
      <div
        id={drawerId}
        inert={!open || undefined}
        className={cn(
          'fixed inset-x-0 top-(--nav-h) z-40 lg:hidden',
          'transition-[opacity,transform] duration-300 ease-out-soft',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <nav
          aria-label="ניווט ראשי בנייד"
          className="mx-3 rounded-panel border border-gold-soft bg-surface p-3 shadow-lift"
        >
          <ul className="flex flex-col">
            {links.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{ '--d': index } as React.CSSProperties}
                  className={cn(
                    'flex min-h-12 items-center justify-between rounded-card px-3 text-[1.0625rem] text-ink',
                    'transition-colors duration-200 hover:bg-gold-wash',
                    index < links.length - 1 && 'border-b border-line/70',
                    open && 'motion-safe:anim-rise'
                  )}
                >
                  {link.label}
                  <Icon
                    name="arrow-left"
                    size={16}
                    className="text-gold-deep opacity-60"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <span className="mt-3 block sm:hidden">
            <ButtonLink
              href="/#builder"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              בניית מארז
              <Icon name="arrow-left" size={18} />
            </ButtonLink>
          </span>
        </nav>
      </div>

      {/* Tapping the page behind the drawer closes it. */}
      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-(--nav-h) z-30 cursor-default bg-ink/20 backdrop-blur-[2px] lg:hidden"
        />
      )}
    </header>
  );
}
