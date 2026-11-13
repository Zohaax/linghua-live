import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AvatarIcon from "@/components/AvatarIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { PATH_ZH, TEACHERS_CORNER_ZH } from "@/lib/learningPaths";
import { playZh } from "@/components/learn/audio";
import { buzz, prefersLessMotion, Speaker, TypeIn, useInView } from "./landingKit";

type Lang = "en" | "ar";

/* 妈 mā and 马 mǎ: the same Arabic sound مَا, a different tone, a different word.
   Contours match ToneLine in the lessons. */
const TONES = [
  { n: 1, zh: "妈", py: "mā", ar: "مَا", meaning: "learn.tones.mother", shape: "learn.tone.1", d: "M8 10 L92 10", end: [92, 10] },
  { n: 3, zh: "马", py: "mǎ", ar: "مَا", meaning: "learn.tones.horse", shape: "learn.tone.3", d: "M8 34 Q34 52 52 48 Q76 42 92 18", end: [92, 18] },
];

/* Flashcard words from Foundation 1, Unit 1 (你好 stays with Hua at the top of the page) */
const WORDS: { zh: string; py: string; ar: string; mean: Record<Lang, string> }[] = [
  { zh: "谢谢", py: "Xièxie", ar: "شْيِه شْيِه", mean: { en: "Thank you", ar: "شكرًا" } },
  { zh: "再见", py: "Zàijiàn", ar: "دْزَايْ جِيَانْ", mean: { en: "Goodbye", ar: "مع السلامة" } },
  { zh: "老师", py: "Lǎoshī", ar: "لَاوْ شْ", mean: { en: "Teacher", ar: "معلّم" } },
];

/* Phrases from the Mandarin on the Move phrasebook, split by syllable so each Arabic sound sits under its pinyin */
const PHRASES: { zh: string; py: string[]; ar: string[]; mean: Record<Lang, string> }[] = [
  { zh: "我要去酒店", py: ["wǒ", "yào", "qù", "jiǔ", "diàn"], ar: ["وُو", "يَاوْ", "تْشْيُو", "جِيُو", "دِيَانْ"], mean: { en: "I want to go to the hotel", ar: "أريد أن أذهب إلى الفندق" } },
  { zh: "多少钱？", py: ["duō", "shao", "qián"], ar: ["دْوُو", "شَاوْ", "تْشِيَانْ"], mean: { en: "How much is it?", ar: "كم السعر؟" } },
  { zh: "我要去火车站", py: ["wǒ", "yào", "qù", "huǒ", "chē", "zhàn"], ar: ["وُو", "يَاوْ", "تْشْيُو", "خْوُو", "تْشَه", "جَانْ"], mean: { en: "I want to go to the train station", ar: "أريد أن أذهب إلى محطة القطار" } },
];

const CLASS_CODE = "LH-4K7Q";

/* Kite (Little Lanterns) and brush and scroll (Teacher's Corner), with parts that move */
const Kite = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g>
      <path d="M32 6 L54 26 L32 46 L10 26 Z" fill="#E8352B" stroke="#2A1E1C" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 6 V46 M10 26 H54" stroke="#FCC755" strokeWidth="3" />
      <circle cx="32" cy="26" r="6" fill="#FCC755" stroke="#2A1E1C" strokeWidth="2.5" />
    </g>
    <g className="ktail">
      <path d="M32 46 q-6 6 0 10 q6 4 0 8" fill="none" stroke="#2A1E1C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27 52 l5 3 l-5 3 z M37 52 l-5 3 l5 3 z" fill="#FCC755" stroke="#2A1E1C" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  </svg>
);
const BrushScroll = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g className="scroll">
      <rect x="10" y="14" width="34" height="40" rx="3" fill="#FFFFFF" stroke="#2A1E1C" strokeWidth="3" />
      <path className="wen" d="M27 21 v4 M18 27 h18 M21 30 q6 14 15 18 M33 30 q-5 13 -14 18" fill="none" stroke="#2A1E1C" strokeWidth="3" strokeLinecap="round" pathLength={1} />
    </g>
    <rect x="7" y="10" width="40" height="7" rx="3.5" fill="#E8352B" stroke="#2A1E1C" strokeWidth="2.5" />
    <rect className="rbot" x="7" y="51" width="40" height="7" rx="3.5" fill="#E8352B" stroke="#2A1E1C" strokeWidth="2.5" />
    <g className="brsh">
      <g transform="rotate(30 50 34)">
        <rect x="47" y="12" width="6" height="30" rx="2" fill="#FCC755" stroke="#2A1E1C" strokeWidth="2.5" />
        <path d="M46 42 h8 l-4 12 z" fill="#2A1E1C" />
      </g>
    </g>
  </svg>
);

/** Section heading: the words rise in one by one, the last part in red with a gold brush stroke */
const FHead = ({ plain, gold, ways }: { plain: string; gold: string; ways?: boolean }) => {
  const [ref, inView] = useInView<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={`fhead rv${ways ? " ways" : ""}${inView ? " in" : ""}`} aria-label={`${plain} ${gold}`}>
      <span aria-hidden="true">
        {plain.split(" ").map((w, i) => (
          <Fragment key={i}><span className="w" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
        ))}
        <span className="w" style={{ "--i": plain.split(" ").length } as React.CSSProperties}>
          <span className="gold" data-t={gold}>{gold}</span>
        </span>
      </span>
    </h2>
  );
};

/* The example's layout for each feature */
const EX: Record<string, string> = { lotus: "tones", bamboo: "prog", dumpling: "deckrow", cat: "move", kite: "kids", brush: "teach" };

/** One feature: a moving icon, a typed heading with glowing red words, a line of text and a live example */
const Feat = ({
  kind, icon, plain, red, name, desc, children,
}: {
  kind: string; icon: ReactNode; plain: string; red: string; name?: ReactNode; desc: string;
  children: (inView: boolean) => ReactNode;
}) => {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`feat rv ${kind}${inView ? " in" : ""}`}>
      <div className="ic"><span className="ico">{icon}</span></div>
      <h3 className="t" aria-label={`${plain} ${red}`}><TypeIn plain={plain} red={red} start={inView} /></h3>
      <p className="d">
        {name && <span className="pname">{name}</span>}
        {desc}
      </p>
      <div className={`ex ${EX[kind]}`}>{children(inView)}</div>
    </div>
  );
};

/* ───────── live examples ───────── */

/** Tap 妈 or 马 to hear it; its tone line draws as it plays. Both lines draw once, silently, on arrival. */
const ToneDemo = ({ inView }: { inView: boolean }) => {
  const { t } = useLanguage();
  const [on, setOn] = useState(-1);
  const [drawn, setDrawn] = useState<boolean[]>(() => TONES.map(() => prefersLessMotion()));
  const [key, setKey] = useState([0, 0]);
  useEffect(() => {
    if (!inView || prefersLessMotion()) return;
    const ids = TONES.map((_, i) => window.setTimeout(() => setDrawn((d) => d.map((v, j) => v || j === i)), 1300 + i * 700));
    return () => ids.forEach(clearTimeout);
  }, [inView]);
  const play = (i: number) => {
    playZh(TONES[i].zh).catch(() => {});
    buzz([10]);
    setOn(i);
    setDrawn((d) => d.map((v, j) => v || j === i));
    setKey((k) => k.map((v, j) => (j === i ? v + 1 : v)));
  };
  return (
    <>
      {TONES.map((tn, i) => (
        <button
          key={tn.zh}
          type="button"
          className={`tn${on === i ? " on" : ""}${drawn[i] ? " drawn" : ""}`}
          onClick={() => play(i)}
          aria-label={`${tn.zh}, ${tn.py}, ${t(tn.meaning)}`}
        >
          <span className="tnum">{t("learn.tone.n").replace("{n}", String(tn.n))}</span>
          {/* a new key restarts the drawing on every tap */}
          <svg key={key[i]} className="tline" viewBox="0 0 100 60" aria-hidden="true">
            {[10, 20, 30, 40, 50].map((y) => <line key={y} x1="4" x2="96" y1={y} y2={y} />)}
            <path className="tg" d={tn.d} pathLength={1} />
            <path className="tk" d={tn.d} pathLength={1} />
            <circle className="tdot" r="5" cx={tn.end[0]} cy={tn.end[1]} />
          </svg>
          <span className="tzh" lang="zh">{tn.zh}</span>
          <span className="tpy l-py">{tn.py}</span>
          <span className="tar" lang="ar" dir="rtl">{tn.ar}</span>
          <span className="ten">{t(tn.meaning)}</span>
          <span className="tsh">{t(tn.shape)}</span>
        </button>
      ))}
      <p className="tnote">
        {t("land.tones.note.a")} <span lang="ar" dir="rtl">مَا</span>{t("land.tones.note.b")}
      </p>
    </>
  );
};

/** The week lights up one day at a time, then two simple numbers */
const ProgressDemo = () => {
  const { t } = useLanguage();
  const days = t("land.days").split(" ");
  return (
    <>
      <div className="days" aria-hidden="true">
        {days.map((d, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties}><i />{d}</span>
        ))}
      </div>
      <div className="stats">
        <div className="st"><b>86%</b><span>{t("land.stats.accuracy")}</span></div>
        <div className="st"><b>24</b><span>{t("land.stats.words")}</span></div>
      </div>
    </>
  );
};

/** One small flashcard: tap to flip, Listen on the back, Review flips it back, Next brings a new word */
const FlashDemo = ({ inView }: { inView: boolean }) => {
  const { t, language } = useLanguage();
  const [k, setK] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [anim, setAnim] = useState("");
  const [pressed, setPressed] = useState("");
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const w = WORDS[k % WORDS.length];

  const flip = () => {
    if (busy.current) return;
    if (prefersLessMotion()) return setFlipped((f) => !f);
    busy.current = true;
    setAnim("squish");
    later(() => { setFlipped((f) => !f); setAnim(""); busy.current = false; }, 220);
  };
  const next = () => {
    if (busy.current) return;
    buzz([12]);
    if (prefersLessMotion()) { setK((n) => n + 1); setFlipped(false); return; }
    busy.current = true;
    setAnim("out");
    later(() => {
      setK((n) => n + 1); setFlipped(false); setAnim("enter");
      later(() => { setAnim(""); busy.current = false; }, 30);
    }, 400);
  };
  const review = () => {
    if (flipped) return flip();
    if (prefersLessMotion()) return;
    setAnim("");
    later(() => setAnim("nudge"), 10);
    later(() => setAnim(""), 470);
  };
  const press = (b: string) => { setPressed(b); later(() => setPressed(""), 160); };

  // show it once by itself, then leave it to the visitor
  const shown = useRef(false);
  useEffect(() => {
    if (!inView || shown.current || prefersLessMotion()) return;
    shown.current = true;
    later(flip, 2000);
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className={`fc${anim ? ` ${anim}` : ""}`}
        role="button"
        tabIndex={0}
        aria-label={t("land.flash.aria")}
        onClick={flip}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}
      >
        <div className="fcin">
          {flipped ? (
            <>
              <span className="py l-py">{w.py}</span>
              <span className="ar" lang="ar" dir="rtl">{w.ar}</span>
              <span className="en">{w.mean[language as Lang] ?? w.mean.en}</span>
              <button
                type="button"
                className="lsn"
                aria-label={t("flashcards.listen")}
                onClick={(e) => { e.stopPropagation(); playZh(w.zh).catch(() => {}); }}
              >
                <Speaker />
              </button>
            </>
          ) : (
            <>
              <span className="zh" lang="zh">{w.zh}</span>
              <span className="tap">{t("land.flash.tap")}</span>
            </>
          )}
        </div>
      </div>
      <div className="dbtns">
        <button type="button" className={`db again${pressed === "r" ? " press" : ""}`} onClick={() => { press("r"); review(); }}>
          {t("land.flash.review")}
        </button>
        <button type="button" className={`db got${pressed === "n" ? " press" : ""}`} onClick={() => { press("n"); next(); }}>
          {t("land.flash.next")}
        </button>
      </div>
    </>
  );
};

/** A tiny phrasebook: tap a phrase to hear it and see its pinyin and Arabic guide */
const MoveDemo = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(-1);
  const [playing, setPlaying] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (i: number) => {
    setOpen(i);
    playZh(PHRASES[i].zh).catch(() => {});
    buzz([10]);
    setPlaying(i);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPlaying(-1), 1500);
  };
  return (
    <>
      <div className="plist">
        {PHRASES.map((p, i) => (
          <button
            key={p.zh}
            type="button"
            className={`prow${open === i ? " open" : ""}${playing === i ? " playing" : ""}`}
            aria-expanded={open === i}
            onClick={() => say(i)}
          >
            <span className="pl">
              <span className="pzh" lang="zh">{p.zh}</span>
              <span className="pen">{p.mean[language as Lang] ?? p.mean.en}</span>
              <span className="pmore">
                <span className="psyls">
                  {p.py.map((py, j) => (
                    <span key={j} className="psy">
                      <span className="ppy l-py">{py}</span>
                      <span className="par" lang="ar" dir="rtl">{p.ar[j]}</span>
                    </span>
                  ))}
                </span>
              </span>
            </span>
            <span className="pspk"><Speaker /></span>
          </button>
        ))}
      </div>
      <Link to="/move" className="move-cta">
        <Button>{t("move.home.cta")}</Button>
      </Link>
    </>
  );
};

/** Picture tiles, like the Little Lanterns picture log-in */
const KidsDemo = () => {
  const { t } = useLanguage();
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => {
    buzz([8]);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  return (
    <>
      <span className="klab">{t("land.kids.tap")}</span>
      <div className="pics">
        {["panda", "dragon", "cat"].map((id, i) => (
          <button
            key={id}
            type="button"
            className="pic"
            style={{ "--i": i } as React.CSSProperties}
            aria-pressed={picked.includes(id)}
            aria-label={t(`avatar.${id}`)}
            onClick={() => toggle(id)}
          >
            <AvatarIcon id={id} />
          </button>
        ))}
      </div>
    </>
  );
};

/** The class code writes itself in, and Copy really copies it */
const TeachDemo = ({ inView }: { inView: boolean }) => {
  const { t } = useLanguage();
  const [n, setN] = useState(() => (prefersLessMotion() ? CLASS_CODE.length : 0));
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!inView || n >= CLASS_CODE.length) return;
    const id = window.setTimeout(() => setN((x) => x + 1), n === 0 ? 1300 : 110);
    return () => clearTimeout(id);
  }, [inView, n]);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  const copy = () => {
    navigator.clipboard?.writeText(CLASS_CODE).catch(() => {});
    buzz([10]);
    setCopied(true);
  };
  return (
    <>
      <div className="code">
        <span className="clab">{t("land.teach.code")}</span>
        <span className="cval" aria-label={CLASS_CODE}>
          <span aria-hidden="true">{CLASS_CODE.slice(0, n)}<span className="gh">{CLASS_CODE.slice(n)}</span></span>
        </span>
      </div>
      <button type="button" className="db again copy" onClick={copy} aria-live="polite">
        {copied ? t("land.teach.copied") : t("land.teach.copy")}
      </button>
    </>
  );
};

/** Everything between Hua's welcome and the night scene */
const LandingFeatures = () => {
  const { t } = useLanguage();
  return (
    <div className="lmid">
      <FHead plain={t("land.features.a")} gold={t("land.features.b")} />
      <div className="feats">
        <Feat kind="lotus" icon={<AvatarIcon id="lotus" />} plain={t("land.f.tones.a")} red={t("land.f.tones.b")} desc={t("land.f.tones.d")}>
          {(inView) => <ToneDemo inView={inView} />}
        </Feat>
        <Feat kind="bamboo" icon={<AvatarIcon id="bamboo" />} plain={t("land.f.progress.a")} red={t("land.f.progress.b")} desc={t("land.f.progress.d")}>
          {() => <ProgressDemo />}
        </Feat>
        <Feat kind="dumpling" icon={<AvatarIcon id="dumpling" />} plain={t("land.f.words.a")} red={t("land.f.words.b")} desc={t("land.f.words.d")}>
          {(inView) => <FlashDemo inView={inView} />}
        </Feat>
      </div>

      <FHead plain={t("land.ways.a")} gold={t("land.ways.b")} ways />
      <div className="feats">
        <Feat
          kind="cat"
          icon={<AvatarIcon id="cat" />}
          plain={t("move.home.title")}
          red={t("land.move.b")}
          name={<>{t("path.on_the_move")} <span lang="zh">{PATH_ZH.on_the_move}</span></>}
          desc={t("land.move.d")}
        >
          {() => <MoveDemo />}
        </Feat>
        <Feat
          kind="kite"
          icon={<Kite />}
          plain={t("land.kids.a")}
          red={t("land.kids.b")}
          name={<>{t("path.little_lanterns")} <span lang="zh">{PATH_ZH.little_lanterns}</span></>}
          desc={t("land.kids.d")}
        >
          {() => <KidsDemo />}
        </Feat>
        <Feat
          kind="brush"
          icon={<BrushScroll />}
          plain={t("land.teach.a")}
          red={t("land.teach.b")}
          name={<>{t("corner.title")} <span lang="zh">{TEACHERS_CORNER_ZH}</span></>}
          desc={t("land.teach.d")}
        >
          {(inView) => <TeachDemo inView={inView} />}
        </Feat>
      </div>
    </div>
  );
};

export default LandingFeatures;
