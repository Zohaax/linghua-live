import { useEffect, useRef, useState } from "react";

/** A short tap on phones that can vibrate (Android); does nothing elsewhere */
export const buzz = (pattern: number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
};

export const prefersLessMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Small speaker with two sound waves (they pulse while something plays) */
export const Speaker = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M5 12 h5 l7 -6 v20 l-7 -6 h-5 z" fill="currentColor" />
    <path className="w1" d="M21 11.5 q3 4.5 0 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <path className="w2" d="M24.5 8 q6 8 0 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/** True once the element has scrolled a quarter into view (and stays true) */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersLessMotion() || !("IntersectionObserver" in window)) return setInView(true);
    const o = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setInView(true); o.disconnect(); } }),
      { threshold: 0.25 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, inView] as const;
}

/**
 * A heading that types itself in once `start` turns true. The red words stay glowing afterwards.
 * The untyped rest is kept as hidden text, so the line never jumps.
 */
export const TypeIn = ({ plain, red, start }: { plain: string; red: string; start: boolean }) => {
  const all = plain.length + red.length;
  const [i, setI] = useState(() => (prefersLessMotion() ? -1 : 0));
  useEffect(() => {
    if (!start || i === -1) return;
    if (i >= all) {
      const done = window.setTimeout(() => setI(-1), 600);
      return () => clearTimeout(done);
    }
    const next = window.setTimeout(() => setI((n) => n + 1), i === 0 ? 250 : 45 + Math.random() * 40);
    return () => clearTimeout(next);
  }, [start, i, all]);

  const space = plain && !plain.endsWith(" ") ? " " : "";
  if (i === -1) {
    return <>{plain}{space}<span className="hl glow">{red}</span></>;
  }
  const caret = <span className="caret" />;
  if (i <= plain.length) {
    return (
      <span aria-hidden="true">
        {plain.slice(0, i)}{caret}<span className="gh">{plain.slice(i)}</span>{space}
        <span className="hl"><span className="gh">{red}</span></span>
      </span>
    );
  }
  const r = i - plain.length;
  return (
    <span aria-hidden="true">
      {plain}{space}<span className="hl">{red.slice(0, r)}{caret}<span className="gh">{red.slice(r)}</span></span>
    </span>
  );
};
