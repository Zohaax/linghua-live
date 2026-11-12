import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Lantern from "@/components/lantern/Lantern";
import Seal from "@/components/Seal";
import Landing from "@/components/landing/Landing";
import { useLanguage } from "@/contexts/LanguageContext";
import PathIcon from "@/components/PathIcon";
import { PATH_ZH, TEACHERS_CORNER_ZH } from "@/lib/learningPaths";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDueWords } from "@/lib/spacedRepetition";
import { useTodayMinutes } from "@/hooks/use-today-minutes";
import GoalIcon from "@/components/GoalIcon";
import { progressText, tierFor } from "@/lib/dailyGoal";
import { listLessons, type Lesson } from "@/lib/lessons";
import { UNIT1 } from "@/content/foundation1/unit1";
import { ON_THE_MOVE, storeFor } from "@/content/courses";
import { loadProgress } from "@/lib/foundationProgress";

const Home = () => {
  const { user } = useAuth();
  return user ? <Today /> : <Landing />;
};

/* Logged in: today's goal, one Continue button, and the other activities */
const Today = () => {
  const { t, language } = useLanguage();
  const { user, profile, learningPath } = useAuth();
  const [streak, setStreak] = useState(0);
  const today = useTodayMinutes();
  const [dueCount, setDueCount] = useState(0);
  const [hasPracticed, setHasPracticed] = useState(true);
  // Lessons the teacher picked for this student's class
  const [lessons, setLessons] = useState<Lesson[]>([]);
  useEffect(() => {
    const classId = profile?.role === "student" ? profile.classroom_id : null;
    if (!classId) return setLessons([]);
    listLessons(classId).then(setLessons).catch(() => setLessons([]));
  }, [profile?.role, profile?.classroom_id]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: progress }, due] = await Promise.all([
        (supabase as any).from("progress").select("current_streak, completed_words").eq("user_id", user.id).maybeSingle(),
        getDueWords(supabase, user.id),
      ]);
      setStreak(progress?.current_streak ?? 0);
      setHasPracticed((progress?.completed_words ?? 0) > 0);
      setDueCount(due.length);
    })();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? "today.morning" : hour < 18 ? "today.afternoon" : "today.evening");
  // Little Lanterns kids give their first name apart ("Abdul Rahman" stays whole)
  const firstName = (user?.user_metadata?.first_name as string | undefined) || (profile?.full_name ?? "").split(" ")[0];
  const goalDone = today.done;
  const isTeacher = profile?.role === "teacher";
  // Foundation 1 is for every learner except HSK Journey, which has its own curriculum
  const showFoundation = !isTeacher && learningPath !== "hsk";
  const unitProgress = loadProgress(user?.id).lessons;
  const unitDone = UNIT1.lessons.filter((l) => unitProgress[l.key]).length;
  const onTheMove = !isTeacher && learningPath === "on_the_move";
  const moveLessons = ON_THE_MOVE.units.flatMap((u) => u.lessons.map((l) => ({ l, store: storeFor(u) })));
  const moveDone = moveLessons.filter(({ l, store }) => loadProgress(user?.id, store).lessons[l.key]).length;

  const activities = [
    // Teachers reach My Classroom from the big button above, so the list starts with speaking
    ...(isTeacher
      ? []
      : [{
          to: "/flashcards",
          seal: "复",
          titleKey: "today.review",
          desc: dueCount > 0 ? `${dueCount} ${t("today.review.due")}` : t("today.review.none"),
          count: dueCount,
        }]),
    ...(isTeacher ? [{ to: "/learn", seal: "学", titleKey: "learn.today.teacher", desc: t("learn.today.teacher.desc") }] : []),
    { to: "/tutor", seal: "说", titleKey: "today.speak", desc: t("today.speak.desc") },
    { to: "/grammar", seal: "文", titleKey: "today.grammar", desc: t("today.grammar.desc") },
    { to: "/translator", seal: "译", titleKey: "today.translate", desc: t("today.translate.desc"), tone: "gold" as const },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          {isTeacher && (
            <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {t("corner.title")} <span lang="zh" className="font-zh normal-case tracking-normal">· {TEACHERS_CORNER_ZH}</span>
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {greeting}
            {firstName && (language === "ar" ? ` يا ${firstName}` : `, ${firstName}`)}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex px-3 py-0.5 rounded-full border-2 border-stroke bg-secondary text-secondary-foreground font-bold text-sm">
              {streak} {t("today.streak")}
            </span>
            {learningPath && (
              <Link
                to="/profile#path"
                className="inline-flex items-center gap-1.5 ps-1 pe-3 py-0.5 rounded-full border-2 border-stroke bg-card font-bold text-sm"
              >
                <PathIcon path={learningPath} className="w-6 h-6" />
                {t(`path.${learningPath}`)}
                <span lang="zh" className="font-zh font-normal text-muted-foreground">{PATH_ZH[learningPath]}</span>
              </Link>
            )}
          </div>
        </div>
        <Lantern mood={goalDone ? "happy" : hasPracticed ? "idle" : "sleepy"} className="w-24 h-24 md:w-28 md:h-28 shrink-0" />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        {!isTeacher && (
          <>
            <div className="flex items-center gap-3">
              <GoalIcon tier={tierFor(today.goal)} className="w-10 h-10 shrink-0" />
              <span className="flex-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("today.goal")}</span>
              <Link to="/profile#goal" className="font-bold tabular-nums">
                {progressText(t, language, today.minutes, today.goal)}
              </Link>
            </div>
            <Progress value={(Math.min(today.minutes, today.goal) / today.goal) * 100} />
          </>
        )}
        {goalDone && <p className="font-semibold text-success-foreground">{t("today.goal.done")}</p>}
        {isTeacher ? (
          <div>
            <p className="text-muted-foreground mb-3">{t("today.class.desc")}</p>
            <Link to="/dashboard">
              <Button size="lg" className="w-full">{t("classroom.mine")}</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground mb-3">{t("today.continue.desc")}</p>
            <Link to="/flashcards">
              <Button size="lg" className="w-full">
                {hasPracticed ? t("today.continue") : t("today.start")}
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {onTheMove && (
        <section className="rounded-[14px] border-2 border-stroke bg-card p-5 flex flex-col gap-3" aria-labelledby="on-the-move">
          <div className="flex items-center gap-4">
            <PathIcon path="on_the_move" className="w-12 h-12 shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 id="on-the-move" className="text-xl font-bold leading-tight">
                {t("path.on_the_move")} <span lang="zh" className="font-zh text-primary">{PATH_ZH.on_the_move}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{t("move.hub.sub")}</p>
            </div>
          </div>
          <Progress value={(moveDone / moveLessons.length) * 100} aria-label={`${moveDone} / ${moveLessons.length}`} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/move">
              <Button size="lg" className="w-full">{moveDone ? t("move.hub.continue") : t("move.hub.start")}</Button>
            </Link>
            <Link to="/move/phrases">
              <Button size="lg" variant="outline" className="w-full">{t("move.phrases.open")}</Button>
            </Link>
          </div>
        </section>
      )}

      {showFoundation && (
        <section className="rounded-[14px] border-2 border-stroke bg-card p-5 flex flex-col gap-3" aria-labelledby="first-spark">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("learn.f1")}</span>
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 shrink-0 rounded-full border-2 border-stroke bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              {UNIT1.number}
            </span>
            <div className="flex-1 min-w-0">
              <h2 id="first-spark" className="text-xl font-bold leading-tight">
                {UNIT1.title[language]} <span lang="zh" className="font-zh text-primary">{UNIT1.zh}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{t("learn.today.desc")}</p>
            </div>
          </div>
          <Progress value={(unitDone / UNIT1.lessons.length) * 100} aria-label={`${unitDone} / ${UNIT1.lessons.length}`} />
          <Link to="/learn">
            <Button size="lg" variant={unitDone ? "outline" : "default"} className="w-full">
              {unitDone ? t("learn.today.continue") : t("learn.today.start")}
            </Button>
          </Link>
        </section>
      )}

      {lessons.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="from-teacher">
          <h2 id="from-teacher" className="text-xl font-bold">
            {t("lesson.from_teacher")} <span lang="zh" className="font-zh font-normal text-muted-foreground">· 老师布置</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {lessons.map((l) => (
              <li key={l.id} className="rounded-[14px] border-2 border-stroke bg-card p-4 flex flex-col gap-3">
                <span>
                  <span className="block text-lg font-bold leading-tight">{l.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t("lesson.count").replace("{w}", String(l.vocabIds.length)).replace("{g}", String(l.grammarIds.length))}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  {l.vocabIds.length > 0 && (
                    <Link to={`/flashcards?lesson=${l.id}`}>
                      <Button size="sm">{t("lesson.practise.words")}</Button>
                    </Link>
                  )}
                  {l.grammarIds.length > 0 && (
                    <Link to={`/grammar?lesson=${l.id}`}>
                      <Button size="sm" variant="outline">{t("lesson.practise.grammar")}</Button>
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="flex flex-col border-2 border-stroke rounded-[14px] bg-card overflow-hidden">
        {activities.map((a) => (
          <li key={a.to} className="border-b-2 border-border last:border-b-0">
            <Link to={a.to} className="flex items-center gap-4 p-4 hover:bg-muted">
              <Seal char={a.seal} tone={"tone" in a ? a.tone : "red"} />
              <div className="flex-1 min-w-0">
                <span className="block text-lg font-bold leading-tight">{t(a.titleKey)}</span>
                <span className="block text-sm text-muted-foreground">{a.desc}</span>
              </div>
              {"count" in a && a.count ? (
                <span className="font-bold text-primary tabular-nums text-lg">{a.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
