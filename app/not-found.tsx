import { ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />
      <div className="flex flex-col gap-3">
        <h1 className="text-title">הדף הזה לא נמצא</h1>
        <p className="text-lg text-ink-muted">
          אולי הקישור השתנה. אפשר לחזור לדף הבית או להתחיל לבנות מארז.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/build" size="lg">
          בואו נתחיל
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          לדף הבית
        </ButtonLink>
      </div>
    </main>
  );
}
