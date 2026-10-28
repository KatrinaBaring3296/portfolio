"use client";

import { useEffect, useRef, useState } from "react";

// Fades and slides its children in the first time they scroll into view.
// The hidden starting state uses `motion-safe:`, so visitors who prefer
// reduced motion see the content immediately.
// Children with the `stagger-child` class (see globals.css) then cascade in
// one after another, using `data-revealed` below.
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only animate once
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-700 ease-out ${
        visible ? "opacity-100" : "motion-safe:translate-y-4 motion-safe:opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
