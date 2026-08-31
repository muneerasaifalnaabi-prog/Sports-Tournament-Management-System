"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function RevealOnScroll({
  children,
  className = "",
  delayMs = 0,
  slideUp = true,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger the reveal — useful for grids of cards. */
  delayMs?: number;
  /** Pair with a fade + rise. Set false on elements that already animate their own transform (e.g. `.showcase-media`), so the two don't fight over the `transform` property. */
  slideUp?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${slideUp ? "translate-y-4" : ""}`
      }`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      ref={ref}
    >
      {children}
    </div>
  );
}
