import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { User, Zap, Flame, BookOpen, Trophy, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevelProgress, getNextLevel } from "@/lib/xp";

const SFI_LEVELS = ["A", "B", "C", "D"];
const DAILY_GOALS = [5, 10, 15, 30];

export default function Profile() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: user, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ["quiz-results-all"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 100),
  });

  const { data: srsCards = [] } = useQuery({
    queryKey: ["srs-cards"],
    queryFn: () => base44.entities.UserSRSCard.list(),
  });

  if (!user) return null;

  const xp = user.xp_total || 0;
  const streak = user.streak_days || 0;
  const { level, progress, xpInLevel, xpNeeded } = getLevelProgress(xp);
  const nextLevel = getNextLevel(xp);
  const initials = user.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const totalCorrect = quizResults.reduce((s, r) => s + (r.score || 0), 0);
  const totalQ = quizResults.reduce((s, r) => s + (r.total || 0), 0);
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  const mastered = srsCards.filter(c => c.status === "mastered").length;

  const handleUpdate = async (fields) => {
    setSaving(true);
    await base44.auth.updateMe(fields);
    await refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">{initials}</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.full_name || "Learner"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      {/* Level + XP */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-semibold">{level.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {nextLevel ? `${xpInLevel} / ${xpNeeded} XP` : "Max level"}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-primary" },
          { label: "Day streak", value: streak, icon: Flame, color: "text-orange-500" },
          { label: "Quizzes done", value: quizResults.length, icon: BookOpen, color: "text-blue-500" },
          { label: "Mastered words", value: mastered, icon: Trophy, color: "text-emerald-500" },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {accuracy > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quiz accuracy</span>
            <span className="font-bold text-primary">{accuracy}%</span>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-5">
          <h2 className="font-semibold">Settings</h2>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">SFI Level</label>
            <div className="flex gap-2">
              {SFI_LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => handleUpdate({ sfi_level: l })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-all ${user.sfi_level === l ? "border-primary bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Daily goal (minutes)</label>
            <div className="flex gap-2">
              {DAILY_GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => handleUpdate({ daily_goal_minutes: g })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${user.daily_goal_minutes === g ? "border-primary bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"}`}
                >
                  {g}m
                </button>
              ))}
            </div>
          </div>

          {saved && <p className="text-sm text-emerald-600 font-medium">✓ Saved!</p>}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4" /> Log out
      </Button>
    </div>
  );
}