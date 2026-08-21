'use client';

import Link from 'next/link';

import { ProductImage } from '@/components/ui/ProductImage';
import { Reveal, SectionHeading } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';
import type { CategoryId, OccasionId, RecipientId } from '@/types';

/* ==========================================================================
   The scroll story: what this store actually makes.

   Editorial spans rather than an even grid — an equal 3×3 reads as a
   catalogue, and the point here is confidence before questions.
   ========================================================================== */

interface Story {
  title: string;
  copy: string;
  image: string;
  category: CategoryId;
  recipient?: RecipientId;
  occasion?: OccasionId;
  /** Grid emphasis on desktop. */
  span: string;
  aspect: string;
}

const stories: Story[] = [
  {
    title: 'מתנה לכלה',
    copy: 'חלוק אישי, מגבות רכות וריח שנשאר בזיכרון מבוקר החתונה.',
    image: '/images/story-bride.webp',
    category: 'robe',
    recipient: 'bride',
    occasion: 'wedding',
    span: 'md:col-span-7',
    aspect: 'aspect-4/3',
  },
  {
    title: 'מתנה לחתן',
    copy: 'יין מיקב בוטיק, סט טיפוח וספר ברכות — מדוד ומכובד.',
    image: '', // ← drop story-groom.jpg into public/images to use a photo,
    category: 'wine',
    recipient: 'groom',
    occasion: 'wedding',
    span: 'md:col-span-5',
    aspect: 'aspect-4/3 md:aspect-3/4',
  },
  {
    title: 'מתנה לזוג',
    copy: 'קרש הגשה, כוסות קריסטל ויין — דברים שנשארים במטבח.',
    image: '', // ← drop story-couple.jpg into public/images to use a photo,
    category: 'homeware',
    recipient: 'couple',
    occasion: 'engagement',
    span: 'md:col-span-5',
    aspect: 'aspect-4/3',
  },
  {
    title: 'מתנה ליולדת',
    copy: 'רגע של שקט ליולדת עצמה, ושמיכה רכה עם שם התינוק.',
    image: '', // ← drop story-mother.jpg into public/images to use a photo,
    category: 'skincare',
    recipient: 'new-mother',
    occasion: 'birth',
    span: 'md:col-span-7',
    aspect: 'aspect-4/3',
  },
  {
    title: 'מתנה ליום הולדת',
    copy: 'טיפוח, שוקולד ונר — מארז שמרגיש כמו יום חופש.',
    image: '', // ← drop story-birthday.jpg into public/images to use a photo,
    category: 'sweets',
    occasion: 'birthday',
    span: 'md:col-span-4',
    aspect: 'aspect-square',
  },
  {
    title: 'מתנה לחג',
    copy: 'יין, דבש ונר הבדלה — מארז שמגישים על השולחן.',
    image: '', // ← drop story-holiday.jpg into public/images to use a photo,
    category: 'judaica',
    occasion: 'holiday',
    span: 'md:col-span-4',
    aspect: 'aspect-square',
  },
  {
    title: 'מתנה למשפחה',
    copy: 'מארז שכולם לוקחים ממנו משהו, בלי פריט שמתאים לאחד בלבד.',
    image: '', // ← drop story-family.jpg into public/images to use a photo,
    category: 'homeware',
    recipient: 'family',
    span: 'md:col-span-4',
    aspect: 'aspect-square',
  },
];

/** Deep-link into the builder with the first answers already chosen. */
function storyHref(story: Story): string {
  const params = new URLSearchParams();
  if (story.recipient) params.set('recipient', story.recipient);
  if (story.occasion) params.set('occasion', story.occasion);
  const query = params.toString();
  return query ? `/build?${query}` : '/build';
}

export function GiftStories() {
  return (
    <section id="stories" className="shell py-24 sm:py-32">
      <SectionHeading
        eyebrow="מה אנחנו מכינים"
        title="כל אירוע מקבל מארז אחר"
        description="אלה כמה מהמארזים שאנחנו בונים הכי הרבה. אפשר להתחיל מאחד מהם, או לענות על כמה שאלות ולקבל התאמה משלכם."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-12">
        {stories.map((story, index) => (
          <Reveal key={story.title} delay={index % 3} className={story.span}>
            <Link
              href={storyHref(story)}
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-panel',
                'border border-line bg-surface shadow-soft',
                'transition-[box-shadow,border-color,transform] duration-300 ease-out-soft',
                'hover:-translate-y-1 hover:border-gold-soft hover:shadow-lift'
              )}
            >
              <div className={cn('relative overflow-hidden', story.aspect)}>
                <ProductImage
                  src={story.image}
                  alt={story.title}
                  category={story.category}
                  emphasis
                  className="size-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="text-heading">{story.title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-ink-muted">
                  {story.copy}
                </p>
                <span className="mt-auto pt-4 text-[0.9rem] font-semibold text-gold-deep">
                  להתאמה אישית
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
