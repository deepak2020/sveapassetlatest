import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Flame, Zap, BookOpen, Landmark, FlaskConical, BarChart3, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevelProgress, getNextLevel } from "@/lib/xp";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "God morgon";
  if (h < 17) return "God eftermiddag";
  return "God kväll";
}

const XP_LEVEL_COLORS = {
  "Nybörjare": "bg-slate-100 text-slate-600",
  "Elev": "bg-blue-100 text-blue-700",
  "Student": "bg-violet-100 text-violet-700",
  "Avancerad": "bg-amber-100 text-amber-700",
  "Medborgare": "bg-emerald-100 text-emerald-700",
};

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: quizResults } = useQuery({
    queryKey: ["quiz-results-recent"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 3),
    initialData: [],
  });

  if (!user) return null;

  const xp = user.xp_total || 0;
  const streak = user.streak_days || 0;
  const { level, progress, xpInLevel, xpNeeded } = getLevelProgress(xp);
  const nextLevel = getNextLevel(xp);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {getGreeting()}, {user.full_name?.split(" ")[0] || "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {user.sfi_level ? `SFI ${user.sfi_level} • ` : ""}{user.goal || "Keep learning Swedish!"}
          </p>
        </div>

        {/* Streak + XP badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{streak}</span>
            <span className="text-xs text-orange-500">day streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{xp.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </div>
        </div>
      </div>

      {/* Level card */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${XP_LEVEL_COLORS[level.name] || "bg-muted text-muted-foreground"}`}>
                {level.name}
              </span>
            </div>
            {nextLevel && (
              <span className="text-xs text-muted-foreground">
                {xpInLevel} / {xpNeeded} XP → {nextLevel.name}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick paths */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/language" className="group">
          <Card className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Svenska</h3>
              <p className="text-sm text-muted-foreground mt-1">Language lessons by SFI level</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Continue →</span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/civic" className="group">
          <Card className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                <Landmark className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-foreground">Samhälle</h3>
              <p className="text-sm text-muted-foreground mt-1">Civic knowledge & citizenship test</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Continue →</span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/language-test" className="group">
          <Card className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <FlaskConical className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground">Tests</h3>
              <p className="text-sm text-muted-foreground mt-1">Quiz yourself across all levels</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Start →</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      {quizResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Recent activity</h2>
            <Link to="/progress" className="text-xs text-primary hover:underline flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> View all
            </Link>
          </div>
          <div className="space-y-2">
            {quizResults.map(r => (
              <Card key={r.id} className="border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.quiz_type === "civic" ? "bg-violet-100" : "bg-blue-100"}`}>
                      {r.quiz_type === "civic" ? <Landmark className="w-4 h-4 text-violet-600" /> : <BookOpen className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.source_title || "Quiz"}</p>
                      <p className="text-xs text-muted-foreground">{r.score}/{r.total} correct</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {r.percentage}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* XP breakdown info */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">How to earn XP</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { label: "Lesson complete", xp: 5 },
              { label: "Practice passed", xp: 15 },
              { label: "Quiz correct", xp: 20 },
              { label: "Flashcard Good/Easy", xp: 10 },
              { label: "7-day streak", xp: 50 },
              { label: "Daily goal met", xp: 25 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border/50">
                <span className="text-muted-foreground text-xs">{item.label}</span>
                <span className="font-bold text-primary text-xs">+{item.xp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}