'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const links = [
  { href: '/baskets', label: 'מארזים מוכנים' },
  { href: '/#inspiration', label: 'השראה' },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-(--nav-h) transition-[background-color,border-color,backdrop-filter] duration-300',
        solid
          ? 'border-b border-line bg-canvas/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        <Logo />

        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className="flex min-h-11 items-center rounded-sm text-[0.9375rem] text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href="/#builder" size="sm">
          בניית מארז
        </ButtonLink>
      </div>
    </header>
  );
}
