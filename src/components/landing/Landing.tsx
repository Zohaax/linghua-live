import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Lantern from "@/components/lantern/Lantern";
import { useLanguage } from "@/contexts/LanguageContext";
import { playZh } from "@/components/learn/audio";
import { buzz, prefersLessMotion, Speaker } from "./landingKit";
import LandingFeatures from "./LandingFeatures";
import "./landing.css";

/* Sky lanterns at the end: x position (%), speed, size (px) */
const SKY: [number, number, number][] = [
  [8, 0.9, 14], [20, 1.25, 11], [33, 0.75, 17], [64, 1.1, 13], [77, 0.85, 18],
  [90, 1.3, 12], [14, 1.05, 10], [84, 0.7, 15], [46, 1.4, 9], [56, 0.95, 12],
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Where p is between a and b, from 0 to 1 */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/* 你好 split into its two syllables, each with pinyin and the Arabic sound guide */
const HELLO = [
  { zh: "你", py: "nǐ", ar: "نِي" },
  { zh: "好", py: "hǎo", ar: "هَاوْ" },
];

/**
 * Logged out Home. Hua is the star: he welcomes you, lights up as you scroll and shows his first word,
 * the features come alive one by one, and at the end night falls and sky lanterns rise around him.
 */
const Landing = () => {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const pin1 = useRef<HTMLElement>(null);
  const pin2 = useRef<HTMLElement>(null);
  const huaRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(-1);
  const [pressed, setPressed] = useState(false);

  // Scroll drives both scenes, so they play forwards and backwards smoothly.
  // Where the browser can tie animations to scrolling itself (Chrome, Edge, Safari 26+), the CSS does it all
  // and this script only measures sizes. Elsewhere it moves the same layers, changing only opacity and transform.
  useEffect(() => {
    const root = rootRef.current, p1 = pin1.current, p2 = pin2.current;
    if (!root || !p1 || !p2) return;
    const still = prefersLessMotion();
    const native = !still && typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()");
    const q1 = (el: Element, sel: string) => el.querySelector(sel) as HTMLElement;
    const s1 = { stage: q1(p1, ".lstage"), glow: q1(p1, ".lglow"), halo: q1(p1, ".lhalo"), title: q1(p1, ".ltitle"), card: q1(p1, ".lcard") };
    const s2 = { night: q1(p2, ".lnight"), glow: q1(p2, ".lglow"), halo: q1(p2, ".lhalo"), end: q1(p2, ".lend") };
    const lamps = Array.from(p2.querySelectorAll<HTMLElement>(".lsky i"));
    let nav = 64, vh = 600, desk = false, last1 = -1, last2 = -1;

    const size = () => {
      nav = (document.querySelector("nav") as HTMLElement | null)?.offsetHeight ?? 64;
      vh = Math.max(420, window.innerHeight - nav);
      desk = window.innerWidth >= 768;
      const hw = desk ? Math.min(310, vh * 0.5) : Math.min(window.innerWidth * 0.62, vh * 0.4);
      root.style.setProperty("--l-nav", `${nav}px`);
      root.style.setProperty("--l-vh", `${vh}px`);
      root.style.setProperty("--l-hw", `${hw}px`);
      last1 = last2 = -1;
    };

    // a scene that is off screen pauses its looping animations
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("live", e.isIntersecting)))
      : null;
    [p1, p2].forEach((pin) => (io ? io.observe(pin) : pin.classList.add("live")));

    const prog = (pin: HTMLElement) => {
      if (still) return 1;
      const r = pin.getBoundingClientRect();
      return clamp01((nav - r.top) / (r.height - vh));
    };
    const scale = (el: HTMLElement, k: number, o: number) => {
      el.style.transform = `translate(-50%, -50%) scale(${k.toFixed(3)})`;
      el.style.opacity = o.toFixed(3);
    };
    const frame = () => {
      // scene 1: welcome, light up, the word appears in his light
      const p = prog(p1);
      if (p !== last1) {
        last1 = p;
        const a = seg(p, 0, 0.22), m = seg(p, 0.06, 0.38), b = seg(p, 0.04, 0.5);
        const y = desk ? 0.1 - 0.18 * m : 0.08 - 0.22 * m;
        s1.title.style.opacity = String(1 - a);
        s1.title.style.transform = `translate3d(0, ${(-40 * a).toFixed(1)}px, 0)`;
        s1.stage.style.transform = `translate3d(0, ${(y * vh).toFixed(1)}px, 0)`;
        scale(s1.glow, 0.75 + 0.55 * b, 0.35 + 0.65 * b);
        scale(s1.halo, 0.8 + 0.3 * b, b);
        const c = s1.card.style;
        c.setProperty("--c1", String(seg(p, 0.42, 0.52)));
        c.setProperty("--c2", String(seg(p, 0.54, 0.64)));
        c.setProperty("--c3", String(seg(p, 0.66, 0.76)));
        c.setProperty("--c4", String(seg(p, 0.78, 0.88)));
      }
      // scene 2: night falls, sky lanterns rise around him
      const q = prog(p2);
      if (q !== last2) {
        last2 = q;
        const n = seg(q, 0, 0.35), e = seg(q, 0.55, 0.72);
        s2.night.style.opacity = (0.96 * n).toFixed(3);
        scale(s2.glow, 0.9 + 0.7 * n, 0.5 + 0.5 * n);
        scale(s2.halo, 1 + 0.35 * n, 0.6 + 0.4 * n);
        s2.end.style.opacity = String(e);
        s2.end.style.transform = `translate3d(0, ${((1 - e) * 20).toFixed(1)}px, 0)`;
        lamps.forEach((l) => {
          const k = seg(q, 0.15 + Number(l.dataset.d), 1);
          l.style.opacity = (Math.min(1, k * 5) * (1 - seg(k, 0.85, 1))).toFixed(3);
          l.style.transform = `translate3d(0, ${(-k * vh * 0.95 * Number(l.dataset.s)).toFixed(1)}px, 0)`;
        });
      }
    };
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; frame(); }); };
    const onResize = () => { size(); if (!native) frame(); };
    size();
    if (!native) {
      frame();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Tap the card: Hua says 你好, gives a little bounce, and each syllable lights as he says it
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const hello = () => {
    playZh("你好").catch(() => {});
    buzz([15, 60, 15]);
    timers.current.forEach(clearTimeout);
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    setPressed(true);
    later(() => setPressed(false), 200);
    const hua = huaRef.current;
    if (hua && !prefersLessMotion()) {
      hua.classList.remove("hi");
      void hua.offsetWidth;
      hua.classList.add("hi");
      later(() => hua.classList.remove("hi"), 800);
    }
    HELLO.forEach((_, i) => {
      later(() => setLit(i), 120 + i * 420);
    });
    later(() => setLit(-1), 120 + HELLO.length * 420 + 100);
  };

  return (
    <div className="landing" ref={rootRef}>
      <section className="pin pin1" ref={pin1}>
        <div className="pin-in">
          <div className="lstage">
            <div className="lglow" />
            <div className="lhalo" />
            <div className="lhua" ref={huaRef}>
              <div className="lfloat"><Lantern mood="happy" /></div>
            </div>
          </div>
          <div className="ltitle">
            <h1>{t("home.hero.title")}</h1>
            <p>{t("land.hero.sub")}</p>
          </div>
          <button type="button" className={`lcard${pressed ? " press" : ""}`} onClick={hello} aria-label={t("land.hello.aria")}>
            <span className="lsyls">
              {HELLO.map((s, i) => (
                <span key={s.zh} className={`lsyl${lit === i ? " on" : ""}`}>
                  <span className="zh" lang="zh">{s.zh}</span>
                  <span className="py l-py">{s.py}</span>
                  <span className="arg" lang="ar" dir="rtl">{s.ar}</span>
                </span>
              ))}
            </span>
            <span className="lab">{t("land.hello")}</span>
            <span className="lspk"><Speaker /></span>
          </button>
        </div>
      </section>

      <LandingFeatures />

      <section className="pin pin2" ref={pin2}>
        <div className="pin-in">
          <div className="lnight" />
          <div className="lsky" aria-hidden="true">
            {SKY.map(([x, s, w], i) => (
              <i key={i} style={{ "--x": `${x}%`, "--w": `${w}px`, "--s": s, "--r": `${15 + (i % 4) * 5}%` } as React.CSSProperties} data-s={s} data-d={(i % 4) * 0.05} />
            ))}
          </div>
          <div className="lstage">
            <div className="lglow" />
            <div className="lhalo" />
            <div className="lhua">
              <div className="lfloat"><Lantern mood="happy" /></div>
            </div>
          </div>
          <div className="lend">
            <h2>{t("home.closing.title")}</h2>
            <Link to="/auth">
              <Button size="lg">{t("home.closing.cta")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
