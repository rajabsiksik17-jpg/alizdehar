"use client";

import { useEffect, useRef, useState } from "react";

/** Animated numeric counter triggered on scroll into view. */
export function StatisticsCounter({
  value,
  suffix = "",
  className,
}: {
  value: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const numeric = parseInt(value, 10);
  const [display, setDisplay] = useState(() =>
    Number.isNaN(numeric) ? value : "0",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const showFinal = () => setDisplay(value);

    if (Number.isNaN(numeric) || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(showFinal);
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          const start = performance.now();
          const duration = 1600;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(String(Math.round(numeric * eased)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, numeric]);

  return (
    <span ref={ref} className={className} dir="ltr">
      {display}
      {suffix}
    </span>
  );
}
