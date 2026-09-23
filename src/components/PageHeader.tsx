import type { ReactNode } from 'react';


/**
 * Sticky page header used at the top of list-style pages (Feed, My Catches,
 * Analytics, etc). Bleeds out to the edges of the <main> content column via
 * negative margins, then re-applies the same padding so nothing shifts.
 *
 * `main` in Layout.tsx uses `px-6 py-8` — if that ever changes, update the
 * -mx-6/-mt-8/px-6/pt-8 values below to match.
 *
 * `top-14` on mobile sits this header just below the Sidebar's mobile top
 * bar (also `h-14`) instead of underneath it — both are `sticky top-*`
 * inside the same scroll container, so without the offset they'd overlap
 * once scrolled. `md:top-0` is correct there since the mobile top bar is
 * hidden (`md:hidden`) on desktop.
 */
export function PageHeader({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className="sticky top-14 z-10 -mx-6 -mt-8 border-b rounded-2xl border-border px-6 pt-8 pb-4 backdrop-blur-sm md:top-0"
      style={{ backgroundColor: 'color-mix(in oklab, var(--color-paper) 92%, transparent)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
