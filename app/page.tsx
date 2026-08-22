import { About } from '@/components/home/About';
import { HomeBuilder } from '@/components/home/HomeBuilder';
import { Inspiration } from '@/components/home/Inspiration';
import { Opening } from '@/components/home/Opening';
import { Visit } from '@/components/home/Visit';
import { BuilderProvider } from '@/components/gift-builder/BuilderContext';
import { SectionRail } from '@/components/ui/SectionRail';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { SiteHeader } from '@/components/ui/SiteHeader';

/* The opening film, a short look at the work, and then the application
   itself. Who Iris is sits below the builder, for anyone who wants to know
   before they commit — never between the customer and the first question. */
export default function HomePage() {
  return (
    <>
      <SiteHeader transparent />
      <SectionRail />
      <main id="main">
        <Opening />
        <Inspiration />
        <BuilderProvider embedded>
          <HomeBuilder />
        </BuilderProvider>
        <About />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
