'use client';

import { useState } from 'react';

import { AdminShell, type AdminTab } from '@/components/admin/AdminShell';
import { BasketAdmin } from '@/components/admin/BasketAdmin';
import { ProductAdmin } from '@/components/admin/ProductAdmin';
import { SettingsAdmin } from '@/components/admin/SettingsAdmin';
import { useStore } from '@/lib/store-context';

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('products');
  const { ready } = useStore();

  /* Wait for stored edits before painting, so the owner never sees seed data
     flash over the changes they made. */
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="size-10 rounded-full border-2 border-gold-soft border-t-gold motion-safe:animate-[iris-spin_0.9s_linear_infinite]" />
        <p className="sr-only">טוען</p>
      </div>
    );
  }

  return (
    <AdminShell tab={tab} onTab={setTab}>
      {tab === 'products' && <ProductAdmin />}
      {tab === 'baskets' && <BasketAdmin />}
      {tab === 'settings' && <SettingsAdmin />}
    </AdminShell>
  );
}
