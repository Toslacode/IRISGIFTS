import type { Metadata } from 'next';

import { AdminPanel } from '@/components/admin/AdminPanel';

export const metadata: Metadata = {
  title: 'ניהול החנות',
  /* An internal tool: keep it out of search results. */
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
