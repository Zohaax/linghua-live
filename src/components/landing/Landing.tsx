import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import Lantern from "@/components/lantern/Lantern";
import { useLanguage } from "@/contexts/LanguageContext";
import { playZh } from "@/components/learn/audio";
import { buzz, prefersLessMotion, Speaker } from "./landingKit";
import LandingFeatures from "./LandingFeatures";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// On phones the address bar hides and shows while you scroll: don't recalculate then, so nothing jumps
ScrollTrigger.config({ ignoreMobileResize: true });

/* Sky lanterns at the end: x position (%), how fast it rises, size (px), where it rests when motion is off (0 low to 1 high, clear of Hua) */
const SKY: [number, number, number, number][] = [
  [8, 0.9, 14, 0.5], [20, 1.25, 11, 0.15], [33, 0.75, 17, 0.72], [64, 1.1, 13, 0.62], [77, 0.85, 18, 0.4],
  [90, 1.3, 12, 0.68], [14, 1.05, 10, 0.3], [84, 0.7, 15, 0.1], [46, 1.4, 9, 0.58], [56, 0.95, 12, 0.45],
];

/* 你好 split into its two syllables, each with pinyin and the Arabic sound guide */
const HELLO = [
  { zh: "你", py: "nǐ", ar: "نِي" },
  { zh: "好", py: "hǎo", ar: "هَاوْ" },
];

/**
 * Logged out Home. Hua is the star: he welcomes you and lights up as you scroll, and 你好 builds in his light.
 * The features come alive one by one, and at the end night falls and sky lanterns rise around him.
 *
 * The two scenes are GSAP ScrollTrigger timelines with a smoothed scrub: the animation glides after your
 * finger or mouse wheel instead of stepping with every scroll event. The scenes stay pinned with CSS sticky
 * (sized in svh/lvh, see landing.css), so pinning never waits on script and the page never changes height
 * when a phone's address bar moves. Only opacity and transform are animated.
 */
const Landing = () => {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const pin1 = useRef<HTMLElement>(null);
  const pin2 = useRef<HTMLElement>(null);
  const huaRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(-1);
  const [pressed, setPressed] = useState(false);

  useGSAP(() => {
    const p1 = pin1.current, p2 = pin2.current, root = rootRef.current;
    if (!p1 || !p2 || !root) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desk: "(min-width: 768px)" }, (ctx) => {
      const { motion, desk } = ctx.conditions as { motion: boolean; desk: boolean };
      if (!motion) return; // a still page, laid out by CSS
      const q1 = gsap.utils.selector(p1), q2 = gsap.utils.selector(p2);
      const nav = () => (document.querySelector("nav") as HTMLElement | null)?.offsetHeight ?? 66;
      // the screen below the header, with the address bar showing (CSS --l-sh)
      const sh = () => (p1.querySelector(".pin-box") as HTMLElement).offsetHeight;
      // how long a scene stays pinned: its section minus the sticky screen
      const held = (pin: HTMLElement) => () => `+=${pin.offsetHeight - (pin.querySelector(".pin-in") as HTMLElement).offsetHeight}`;
      const scene = (pin: HTMLElement) => ({
        trigger: pin,
        start: () => `top ${nav()}px`,
        end: held(pin),
        scrub: 0.6, // seconds to glide to the scroll position: this is what makes it feel smooth
        invalidateOnRefresh: true,
      });
      const pop = { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" };
      const [y0, y1] = desk ? [0.1, -0.08] : [0.08, -0.14];

      // The welcome: his title steps aside, he lights up and rises, and 你好 builds in his light
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: scene(p1) })
        .fromTo(q1(".ltitle"), { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.22 }, 0)
        .fromTo(q1(".lglow.big"), { opacity: 0 }, { opacity: 1, duration: 0.46 }, 0.04)
        .fromTo(q1(".lhalo"), { opacity: 0 }, { opacity: 1, duration: 0.46 }, 0.04)
        .fromTo(q1(".lstage"), { y: () => sh() * y0 }, { y: () => sh() * y1, duration: 0.32 }, 0.06)
        .fromTo(q1(".lcard"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.42)
        .fromTo(q1(".lsyl .zh"), { opacity: 0, y: 14 }, pop, 0.42)
        .fromTo(q1(".lsyl .py, .lcard .lspk"), { opacity: 0, y: 14 }, pop, 0.54)
        .fromTo(q1(".ldiv"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.54)
        .fromTo(q1(".lsyl .arg"), { opacity: 0, y: 14 }, pop, 0.66)
        .fromTo(q1(".lcard .lab"), { opacity: 0, y: 14 }, pop, 0.78)
        .set({}, {}, 1); // the finished card rests for the last stretch

      // The ending: night falls, his glow grows, sky lanterns rise with your scroll, then the way in
      const tl2 = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: scene(p2) })
        .fromTo(q2(".lnight"), { opacity: 0 }, { opacity: 0.96, duration: 0.35 }, 0)
        .fromTo(q2(".lglow.big"), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0)
        .fromTo(q2(".lend"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.17, ease: "power2.out" }, 0.55)
        .set({}, {}, 1);
      // each sky lantern sets off a little after the last and rises at its own speed, fading in and out
      q2(".lsky i").forEach((lamp: HTMLElement) => {
        const at = 0.15 + Number(lamp.dataset.d), len = 1 - at, speed = Number(lamp.dataset.s);
        tl2
          .fromTo(lamp, { y: 0 }, { y: () => -sh() * 0.95 * speed, duration: len }, at)
          .fromTo(lamp, { opacity: 0 }, { opacity: 1, duration: len * 0.2 }, at)
          .fromTo(lamp, { opacity: 1 }, { opacity: 0, duration: len * 0.15, immediateRender: false }, at + len * 0.85);
      });
    });

    // Recalculate where the scenes start when the page above them changes height
    // (fonts arriving, a phrase opening, switching language). Never on scroll.
    let wait = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(wait);
      wait = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(root);
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    return () => {
      clearTimeout(wait);
      ro.disconnect();
      mm.revert();
    };
  }, { scope: rootRef });

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      pin1.current?.classList.add("live");
      pin2.current?.classList.add("live");
      return;
    }
    // a scene that is off screen pauses its looping animations
    const live = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("live", e.isIntersecting)));
    [pin1.current, pin2.current].forEach((pin) => pin && live.observe(pin));
    // the small looping touches in the features (glowing words, swaying icons) rest while off screen
    const rest = new IntersectionObserver(
      (es) => es.forEach((e) => {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) delete el.dataset.off;
        else el.dataset.off = "";
      }),
      { rootMargin: "100px 0px" },
    );
    rootRef.current?.querySelectorAll(".feat, .fhead").forEach((el) => rest.observe(el));
    return () => {
      live.disconnect();
      rest.disconnect();
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
          <div className="pin-box">
            <div className="ltitle">
              <h1>{t("home.hero.title")}</h1>
              <p>{t("land.hero.sub")}</p>
            </div>
            <div className="lstage">
              <div className="lglow" />
              <div className="lglow big" />
              <div className="lhalo" />
              <div className="lhua" ref={huaRef}>
                <div className="lfloat"><Lantern mood="happy" /></div>
              </div>
            </div>
            <button type="button" className={`lcard${pressed ? " press" : ""}`} onClick={hello} aria-label={t("land.hello.aria")}>
              <span className="lsyls">
                <span className="ldiv" aria-hidden="true" />
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
        </div>
      </section>

      <LandingFeatures />

      <section className="pin pin2" ref={pin2}>
        <div className="pin-in">
          <div className="lnight" />
          <div className="lsky" aria-hidden="true">
            {SKY.map(([x, speed, w, rest], i) => (
              <i
                key={i}
                style={{ "--x": `${x}%`, "--w": `${w}px`, "--p": rest } as React.CSSProperties}
                data-s={speed}
                data-d={(i % 4) * 0.05}
              />
            ))}
          </div>
          <div className="pin-box">
            <div className="lstage">
              <div className="lglow" />
              <div className="lglow big" />
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
        </div>
      </section>
    </div>
  );
};

export default Landing;
