import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Lantern from "@/components/lantern/Lantern";
import { useLanguage } from "@/contexts/LanguageContext";
import { playZh } from "@/components/learn/audio";
import { buzz, prefersLessMotion, Speaker } from "./landingKit";
import LandingFeatures from "./LandingFeatures";
import "./landing.css";

/* Sky lanterns at the end: x position (%), size (px), rise time (s), delay (s) */
const SKY: [number, number, number, number][] = [
  [8, 14, 9, 0], [22, 11, 11, 3.5], [36, 16, 8.5, 6], [64, 13, 10, 1.5], [78, 17, 9.5, 5],
  [91, 12, 11.5, 2.5], [50, 10, 12, 8],
];

/* 你好 split into its two syllables, each with pinyin and the Arabic sound guide */
const HELLO = [
  { zh: "你", py: "nǐ", ar: "نِي" },
  { zh: "好", py: "hǎo", ar: "هَاوْ" },
];

/**
 * Logged out Home. Hua is the star: he welcomes you and lights up, the features come alive one by one,
 * and at the end it is night and sky lanterns rise around him.
 * Nothing is tied to the scroll position: the page scrolls natively and each scene plays on its own clock,
 * moving only opacity and transform, so the browser never has to work while the finger moves.
 */
const Landing = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const huaRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(-1);
  const [pressed, setPressed] = useState(false);

  // a scene that is off screen pauses its looping animations; the ending starts when it comes into view
  useEffect(() => {
    const els = [heroRef.current, endRef.current].filter(Boolean) as HTMLElement[];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("live", "seen"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        e.target.classList.toggle("live", e.isIntersecting);
        if (e.isIntersecting) e.target.classList.add("seen");
      }),
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
    <div className="landing">
      <section className="lhero" ref={heroRef}>
        <div className="ltitle">
          <h1>{t("home.hero.title")}</h1>
          <p>{t("land.hero.sub")}</p>
        </div>
        <div className="lstage">
          <div className="lglow" />
          <div className="lhalo" />
          <div className="lhua" ref={huaRef}>
            <div className="lfloat"><Lantern mood="happy" /></div>
          </div>
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
      </section>

      <LandingFeatures />

      <section className="lnightsec" ref={endRef}>
        <div className="lsky" aria-hidden="true">
          {SKY.map(([x, w, d, delay], i) => (
            <i key={i} style={{ "--x": `${x}%`, "--w": `${w}px`, "--d": `${d}s`, "--dl": `${delay}s` } as React.CSSProperties} />
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
      </section>
    </div>
  );
};

export default Landing;
