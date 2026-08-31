import { cn } from "@/lib/utils";
import type { PageBackground } from "@/lib/page-background";
import { Reveal } from "@/components/reveal";

/**
 * Configurable page hero. Background, overlay, colors and alignment are
 * driven by the resolved PageBackground (global default + per-page override).
 */
export function PageHero({
  title,
  subtitle,
  background,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  background: PageBackground;
  children?: React.ReactNode;
}) {
  const overlay = Math.min(1, Math.max(0, background.overlay ?? 0.86));

  return (
    <section className="relative overflow-hidden pt-36 pb-16" style={{ backgroundColor: background.color }}>
      {/* Background images */}
      {background.image ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-cover md:block"
          style={{ backgroundImage: `url(${background.image})`, backgroundPosition: background.position }}
        />
      ) : null}
      {background.mobile_image ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover md:hidden"
          style={{ backgroundImage: `url(${background.mobile_image})`, backgroundPosition: background.position }}
        />
      ) : background.image ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover md:hidden"
          style={{ backgroundImage: `url(${background.image})`, backgroundPosition: background.position }}
        />
      ) : null}

      {/* Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-brand-950"
        style={{ opacity: overlay }}
      />

      {/* Decorative pattern (shown when no image or behind overlay) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#fff" strokeWidth="1">
            <circle cx="600" cy="200" r="180" />
            <circle cx="600" cy="200" r="100" />
            <path d="M0 200H1200M600 0V400" />
          </g>
        </svg>
      </div>

      <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
        <Reveal className={cn("max-w-3xl", background.align === "center" && "mx-auto text-center")}>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{ color: background.heading_color }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 text-lg leading-relaxed" style={{ color: background.description_color }}>
              {subtitle}
            </p>
          ) : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
