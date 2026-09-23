import { Link, Navigate } from 'react-router-dom';
import { Fish, MapPin, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { CastDivider } from '../../components/CastDivider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
  { icon: Fish, title: 'Log every catch', body: 'Species, weight, length, gear, bait, and notes — all in one place.' },
  { icon: MapPin, title: 'Track your spots', body: 'Save locations privately or share them with the community.' },
  { icon: Users, title: 'Follow other anglers', body: 'See what people you follow are reeling in, and swap stories.' },
  { icon: BarChart3, title: 'See your stats', body: 'Personal bests, trends over time, and your top species and spots.' },
];

// Polaroid-style photos scattered around the hero text. Position/rotation is
// per-tile via the className below — add, remove, or reposition as needed.
// Each needs its own placement so they don't overlap the centered copy.
const HERO_POLAROIDS = [
  { src: '/sunset.jpg', alt: "Fishing rod at the water's edge", className: '-left-4 top-6 w-40 -rotate-6 hidden lg:block' },
  { src: '/rod_with_catch.jpg', alt: 'A rod bent with a catch', className: '-right-2 top-24 w-44 rotate-3 hidden lg:block' },
  { src: '/two_rods.jpg', alt: 'Two rods set up on the bank', className: 'left-10 bottom-0 w-36 rotate-2 hidden xl:block' },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Already signed in? Skip the pitch and go straight to the feed.
  if (isAuthenticated) return <Navigate to="/feed" replace />;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-[color:var(--color-paper)]/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4 lg:px-12">
        <Link to="/" className="wordmark flex items-center gap-1 text-lg sm:gap-1.5 sm:text-2xl">
          <img src="/logo-icon.svg" alt="" className="h-6 w-auto sm:h-8" />
          CastJournal
        </Link>
       <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/login"><Button variant="ghost" size="sm" className="sm:h-9 sm:px-4 sm:text-sm">Log in</Button></Link>
          <Link to="/register"><Button size="sm" className="sm:h-9 sm:px-4 sm:text-sm">Sign up</Button></Link>
        </div>
      </header>

      <section className="animated-gradient-bg relative overflow-hidden px-6 py-20 text-center lg:py-28">
        {HERO_POLAROIDS.map((p) => (
          <div
            key={p.src}
            className={cn(
              'absolute rounded-sm bg-white p-2 pb-6 shadow-xl ring-1 ring-black/5 transition-transform hover:rotate-0',
              p.className
            )}
          >
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img src={p.src} alt={p.alt} className="size-full object-cover" />
            </div>
          </div>
        ))}

        <div className="relative mx-auto max-w-2xl">
          <h1 className="font-heading text-4xl lg:text-5xl">
            Every catch has a <span className="gradient-text font-black">story.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Log it, share it, relive it. CastJournal is a fishing log built for anglers who want to
            remember more than just the size of the one that didn't get away.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register"><Button size="lg">Get started — it's free</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Log in</Button></Link>
          </div>
        </div>
    

        <section className="mx-auto max-w-5xl px-6 pt-24">
          <div className="text-center">
            <h2 className="font-heading text-2xl">"The river doesn't repeat itself. Neither does a good log."</h2>
            <CastDivider />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent>
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-3 font-heading text-base">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>       
      <footer className="border-t border-border py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CastJournal by Clrns V
      </footer>
    </div>
  );
}