import { Link } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';

// Add real photo paths here later, e.g. '/images/auth/lake-sunrise.jpg' — 2+ enables the slideshow.
const SLIDES: string[] = [
    '/dakak.jpg',
  
    
];

export function AuthLayout({ children }: { children: ReactNode }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (SLIDES.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT: photo only — does not bleed into the right column anymore */}
      <div className="relative hidden overflow-hidden lg:block">
        {SLIDES.length > 0 ? (
          SLIDES.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url(${src})`, opacity: i === slide ? 1 : 0 }}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-forest)] via-[color:var(--color-river)] to-[color:var(--color-forest)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute right-10 bottom-10 left-10 text-white">
          <p className="font-heading text-2xl italic">Every catch has a story.</p>
          <p className="mt-1 text-sm text-white/80">Log it, share it, relive it.</p>
        </div>
      </div>

      {/* RIGHT: solid flat color — the card gets its frosted look from the
          blurred accent blobs behind it, not from any photo texture */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[color:var(--color-paper)] px-6 py-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[color:var(--color-river)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[color:var(--color-brass)]/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[color:var(--color-forest)]/10 blur-3xl" />

        <div className="relative w-full max-w-sm">
          <Link to="/" className="wordmark mb-2 flex items-center justify-center gap-2 text-3xl sm:text-5xl">
            <img src="/logo-icon.svg" alt="" className="h-10 w-auto sm:h-17" />
            CastJournal
          </Link>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Your fishing log, your way — track catches, spots, and stories.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
