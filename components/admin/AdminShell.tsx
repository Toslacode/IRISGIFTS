'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

export type AdminTab = 'products' | 'baskets' | 'settings';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'products', label: 'מוצרים' },
  { id: 'baskets', label: 'מארזים מוכנים' },
  { id: 'settings', label: 'הגדרות' },
];

/* Visually consistent with the customer side, but plainer: this is a work
   surface, so it trades atmosphere for density and speed. */
export function AdminShell({
  tab,
  onTab,
  children,
}: {
  tab: AdminTab;
  onTab: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="shell flex flex-col gap-3 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <Logo />
              <span className="text-[0.875rem] text-ink-muted">ניהול</span>
            </div>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-[0.875rem] text-ink-muted transition-colors duration-200 hover:bg-canvas-deep hover:text-ink"
            >
              <Icon name="arrow-right" size={16} />
              לאתר
            </Link>
          </div>

          <nav aria-label="ניווט ניהול">
            <ul className="no-scrollbar flex gap-1 overflow-x-auto">
              {TABS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onTab(item.id)}
                    aria-current={tab === item.id ? 'page' : undefined}
                    className={cn(
                      'min-h-11 shrink-0 cursor-pointer rounded-pill px-4 text-[0.9375rem] transition-colors duration-200',
                      tab === item.id
                        ? 'bg-ink font-medium text-canvas'
                        : 'text-ink-muted hover:bg-canvas-deep hover:text-ink'
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="shell py-8">
        {children}
      </main>
    </div>
  );
}

/** A save confirmation that fades rather than a toast library. */
export function SavedFlash({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="status"
      className="anim-fade inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-success"
    >
      <Icon name="check" size={15} strokeWidth={2.4} />
      נשמר
    </span>
  );
}

export function useSavedFlash() {
  const [saved, setSaved] = useState(false);

  const flash = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return { saved, flash };
}
