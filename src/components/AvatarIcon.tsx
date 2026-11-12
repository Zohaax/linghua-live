import { cn } from "@/lib/utils";
import { AVATAR_IDS, type AvatarId } from "@/lib/avatars";

/* Learner avatars: small drawings in the lantern's palette, easy to recognise for new learners. */
const INK = "#2A1E1C";
const RED = "#E8352B";
const GOLD = "#FCC755";
const WHITE = "#FFFFFF";
const GREEN = "#3FA66B";
const PINK = "#F59BA8";

/* sitting panda with Hua's eyes, no bamboo */
const Panda = () => (
  <>
    <ellipse cx="33" cy="49" rx="14" ry="11" fill="#FFFFFF" stroke="#2A1E1C" strokeWidth="2.5"/>
    <ellipse cx="22" cy="57" rx="6.5" ry="5" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2"/>
    <ellipse cx="44" cy="57" rx="6.5" ry="5" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2"/>
    <circle cx="21" cy="57.5" r="2.4" fill="#FFFFFF"/>
    <circle cx="45" cy="57.5" r="2.4" fill="#FFFFFF"/>
    <ellipse cx="45" cy="45" rx="4.5" ry="7" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2" transform="rotate(-18 45 45)"/>
    <ellipse cx="21" cy="45" rx="4.5" ry="7" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2" transform="rotate(18 21 45)"/>
    <circle cx="17" cy="13" r="6" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2.4"/>
    <circle cx="49" cy="13" r="6" fill="#3A2D2B" stroke="#2A1E1C" strokeWidth="2.4"/>
    <ellipse cx="33" cy="26" rx="19" ry="16" fill="#FFFFFF" stroke="#2A1E1C" strokeWidth="3"/>
    <ellipse cx="25.3" cy="24.5" rx="5.4" ry="6.6" fill="#6E5A55" transform="rotate(-20 25.3 24.5)"/>
    <ellipse cx="40.7" cy="24.5" rx="5.4" ry="6.6" fill="#6E5A55" transform="rotate(20 40.7 24.5)"/>
    <ellipse cx="25.6" cy="24.6" rx="2.9" ry="3.7" fill="#2A1E1C"/>
    <circle cx="26.6" cy="23.3" r="1.1" fill="#FFFFFF"/>
    <ellipse cx="40.4" cy="24.6" rx="2.9" ry="3.7" fill="#2A1E1C"/>
    <circle cx="41.4" cy="23.3" r="1.1" fill="#FFFFFF"/>
    <ellipse cx="33" cy="30" rx="2.7" ry="1.9" fill="#2A1E1C"/>
    <path d="M29.4 32.4 Q33 31.4 36.6 32.4 Q36 37.6 33 37.6 Q30 37.6 29.4 32.4Z" fill="#2A1E1C"/>
    <ellipse cx="33" cy="35.8" rx="2.2" ry="1.3" fill="#FF7A8A"/>
    <circle cx="18.5" cy="32" r="2.6" fill="#F59BA8"/>
    <circle cx="47.5" cy="32" r="2.6" fill="#F59BA8"/>
  </>
);

/* winged little red dragon */
const Dragon = () => (
  <>
    <path d="M22 45 L5 33 Q3 41 8 44 Q6 49 11 50 Q12 54 20 52 Z" fill="#C61F18" stroke="#2A1E1C" strokeWidth="2.2" strokeLinejoin="round"/>
    <path d="M20 46.5 L9 38.5 Q9 42 11.5 44 Q10.5 47 14 47.5 Q15 50 20 49.5 Z" fill="#FFE6C2"/>
    <g transform="translate(64 0) scale(-1 1)">
    <path d="M22 45 L5 33 Q3 41 8 44 Q6 49 11 50 Q12 54 20 52 Z" fill="#C61F18" stroke="#2A1E1C" strokeWidth="2.2" strokeLinejoin="round"/>
    <path d="M20 46.5 L9 38.5 Q9 42 11.5 44 Q10.5 47 14 47.5 Q15 50 20 49.5 Z" fill="#FFE6C2"/>
    </g>
    <path d="M39 55 q11 1 11 -8" fill="none" stroke="#2A1E1C" strokeWidth="7" strokeLinecap="round"/>
    <path d="M39 55 q11 1 11 -8" fill="none" stroke="#E8352B" strokeWidth="3.4" strokeLinecap="round"/>
    <path d="M50 48 q-4 -3 -1 -7 q2 -2 4 1 q3 3 -1 6 z" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="1.8"/>
    <ellipse cx="27" cy="59.5" rx="3.6" ry="2.2" fill="#E8352B" stroke="#2A1E1C" strokeWidth="2"/>
    <ellipse cx="37" cy="59.5" rx="3.6" ry="2.2" fill="#E8352B" stroke="#2A1E1C" strokeWidth="2"/>
    <rect x="23" y="41" width="18" height="18" rx="8" fill="#E8352B" stroke="#2A1E1C" strokeWidth="2.5"/>
    <ellipse cx="32" cy="51" rx="5" ry="6" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="1.6"/>
    <path d="M28.5 49 h7 M28.5 52.5 h7" stroke="#2A1E1C" strokeWidth="1.2" strokeLinecap="round" opacity=".45"/>
    <path d="M22 15 Q19 11 15 11 Q12 9 14 6 Q17 5 19 8 Q19 4 23 4 Q26 6 24 10 Q27 12 26 16 Z" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="2" strokeLinejoin="round"/>
    <g transform="translate(64 0) scale(-1 1)">
    <path d="M22 15 Q19 11 15 11 Q12 9 14 6 Q17 5 19 8 Q19 4 23 4 Q26 6 24 10 Q27 12 26 16 Z" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="2" strokeLinejoin="round"/>
    </g>
    <path d="M15 22 L5 17 L9 30 Z" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="2" strokeLinejoin="round"/>
    <g transform="translate(64 0) scale(-1 1)">
    <path d="M15 22 L5 17 L9 30 Z" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="2" strokeLinejoin="round"/>
    </g>
    <circle cx="13.5" cy="33" r="4" fill="#C61F18" stroke="#2A1E1C" strokeWidth="2"/>
    <g transform="translate(64 0) scale(-1 1)">
    <circle cx="13.5" cy="33" r="4" fill="#C61F18" stroke="#2A1E1C" strokeWidth="2"/>
    </g>
    <ellipse cx="32" cy="27" rx="19" ry="17" fill="#E8352B" stroke="#2A1E1C" strokeWidth="3"/>
    <ellipse cx="32" cy="34" rx="14" ry="9.5" fill="#FFE6C2" stroke="#2A1E1C" strokeWidth="2"/>
    <ellipse cx="25.5" cy="18" rx="2.6" ry="1.5" fill="#FFE6C2"/>
    <ellipse cx="38.5" cy="18" rx="2.6" ry="1.5" fill="#FFE6C2"/>
    <circle cx="25" cy="24.5" r="2.7" fill="#2A1E1C"/>
    <circle cx="39" cy="24.5" r="2.7" fill="#2A1E1C"/>
    <circle cx="25.9" cy="23.6" r="0.9" fill="#FFFFFF"/>
    <circle cx="39.9" cy="23.6" r="0.9" fill="#FFFFFF"/>
    <path d="M29 28 q1.3 -1.2 2.4 0 M32.6 28 q1.3 -1.2 2.4 0" fill="none" stroke="#2A1E1C" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M24.5 31 Q32 30 39.5 31 Q38.5 41 32 41 Q25.5 41 24.5 31 Z" fill="#2A1E1C"/>
    <ellipse cx="32" cy="38" rx="4.2" ry="2" fill="#FF5D4D"/>
    <path d="M27 31 l1.2 2.4 l1.2 -2.4 Z M34.6 31 l1.2 2.4 l1.2 -2.4 Z" fill="#FFFFFF"/>
  </>
);

/* white soup dumpling, eyes closed */
const Dumpling = () => (
  <>
    <path d="M7 41 Q5 25 20 20 Q25 18.5 28.3 18 Q28.6 13.5 30.6 12.6 Q32 11.6 33.4 12.6 Q35.4 13.5 35.7 18 Q39 18.5 44 20 Q59 25 57 41 Q55 55 32 55 Q9 55 7 41Z" fill="#FFFFFF" stroke="#2A1E1C" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M29.6 17.5 Q30.5 14.5 32 13.4 M32 13.4 Q33.5 14.5 34.4 17.5" fill="none" stroke="#2A1E1C" strokeWidth="1.6" strokeLinecap="round" opacity=".5"/>
    <path d="M30.5 18 Q24 21.5 15 25 M31.3 18.5 Q28 23 25 27.5 M32.7 18.5 Q36 23 39 27.5 M33.5 18 Q40 21.5 49 25" fill="none" stroke="#2A1E1C" strokeWidth="1.5" strokeLinecap="round" opacity=".35"/>
    <path d="M20.5 37 q3 3.4 6 0 M37.5 37 q3 3.4 6 0" fill="none" stroke="#2A1E1C" strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M29 42 q3 2.8 6 0" fill="none" stroke="#2A1E1C" strokeWidth="2.2" strokeLinecap="round"/>
    <ellipse cx="18" cy="43" rx="3.6" ry="2.3" fill="#F59BA8"/>
    <ellipse cx="46" cy="43" rx="3.6" ry="2.3" fill="#F59BA8"/>
  </>
);

const LuckyCat = () => (
  <>
    {/* ears */}
    <path d="M14 26 l2 -16 l12 10 z M50 26 l-2 -16 l-12 10 z" fill={WHITE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M17 22 l1 -7 l5 4 z M47 22 l-1 -7 l-5 4 z" fill={PINK} />
    {/* head */}
    <ellipse cx="32" cy="36" rx="21" ry="18" fill={WHITE} stroke={INK} strokeWidth="3" />
    {/* raised paw */}
    <ellipse className="paw" cx="54" cy="22" rx="6" ry="8" fill={WHITE} stroke={INK} strokeWidth="2.5" />
    {/* eyes */}
    <path d="M22 34 q3 -3 6 0 M36 34 q3 -3 6 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M30 40 l2 2 l2 -2" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* collar and bell */}
    <path d="M16 48 q16 8 32 0" fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="53" r="4" fill={GOLD} stroke={INK} strokeWidth="2" />
  </>
);

const Lotus = () => (
  <>
    <path d="M32 12 q10 12 0 32 q-10 -20 0 -32 z" fill={PINK} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M14 22 q14 4 18 22 q-16 -2 -18 -22 z M50 22 q-14 4 -18 22 q16 -2 18 -22 z" fill={PINK} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M6 36 q16 0 26 8 q-18 4 -26 -8 z M58 36 q-16 0 -26 8 q18 4 26 -8 z" fill={WHITE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <ellipse cx="32" cy="50" rx="22" ry="5" fill={GREEN} stroke={INK} strokeWidth="2.5" />
  </>
);

const Bamboo = () => (
  <>
    <rect x="18" y="6" width="12" height="52" rx="5" fill={GREEN} stroke={INK} strokeWidth="3" />
    <path d="M18 22 h12 M18 40 h12" stroke={INK} strokeWidth="2.5" />
    <rect x="36" y="16" width="10" height="42" rx="4.5" fill={GREEN} stroke={INK} strokeWidth="3" />
    <path d="M36 32 h10 M36 46 h10" stroke={INK} strokeWidth="2.5" />
    {/* leaves */}
    <path d="M30 20 q10 -10 20 -6 q-8 8 -20 6 z" fill={GREEN} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M18 34 q-10 -6 -14 2 q8 4 14 -2 z" fill={GREEN} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    {/* face on the big stalk */}
    <circle cx="22" cy="30" r="1.5" fill={INK} />
    <circle cx="27" cy="30" r="1.5" fill={INK} />
    <path d="M22.5 33.5 q2 1.5 4 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
  </>
);

const ICON: Record<AvatarId, () => JSX.Element> = {
  panda: Panda,
  dragon: Dragon,
  dumpling: Dumpling,
  cat: LuckyCat,
  lotus: Lotus,
  bamboo: Bamboo,
};

const AvatarIcon = ({ id, className }: { id?: string | null; className?: string }) => {
  const key = (AVATAR_IDS as readonly string[]).includes(id ?? "") ? (id as AvatarId) : "panda";
  const Icon = ICON[key];
  return (
    <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} aria-hidden="true">
      <Icon />
    </svg>
  );
};

export default AvatarIcon;
