import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Flame, Zap, BookOpen, Landmark, FlaskConical, BarChart3, Trophy, Star, Dumbbell, Target, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getLevelProgress, getNextLevel } from "@/lib/xp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import EmptyState from "../components/shared/EmptyState";

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: user, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: quizResults } = useQuery({
    queryKey: ["quiz-results-recent"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 20),
    initialData: [],
  });

  const { data: srsCards = [] } = useQuery({
    queryKey: ["srs-cards"],
    queryFn: () => base44.entities.UserSRSCard.list(),
  });

  const { data: vocabulary = [] } = useQuery({
    queryKey: ["my-vocabulary"],
    queryFn: () => base44.entities.UserVocabulary.list(),
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["quizResults"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 100),
  });

  if (!user) return null;

  const handleUpdate = async (fields) => {
    setSaving(true);
    await base44.auth.updateMe(fields);
    await refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteVocab = async (vocabId) => {
    await base44.entities.UserVocabulary.delete(vocabId);
    window.location.reload();
  };

  const today = new Date().toISOString().split("T")[0];
  const dueCount = srsCards.filter(c => c.due_date <= today && c.status !== "mastered").length;
  
  // Gym stats
  const gymStats = {
    total: srsCards.length,
    mastered: srsCards.filter(c => c.mastery_percentage === 100).length,
    learning: srsCards.filter(c => c.mastery_percentage < 100 && c.mastery_percentage > 0).length,
    new: srsCards.filter(c => c.mastery_percentage === 0).length,
  };
  const masteredPct = gymStats.total > 0 ? Math.round((gymStats.mastered / gymStats.total) * 100) : 0;

  // Estimate today's activity in minutes: each quiz result = ~2 min, each SRS card answered today = ~0.5 min
  const todayResults = quizResults.filter(r => r.created_date?.startsWith(today));
  const estimatedMinutesToday = todayResults.length * 2;
  const dailyGoalPct = user.daily_goal_minutes
    ? Math.min(100, Math.round((estimatedMinutesToday / user.daily_goal_minutes) * 100))
    : 0;

  const xp = user.xp_total || 0;
  const streak = user.streak_days || 0;
  const { level, progress, xpInLevel, xpNeeded } = getLevelProgress(xp);
  const nextLevel = getNextLevel(xp);
  const initials = user.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  // Progress metrics
  const languageResults = results.filter((r) => r.quiz_type === "language");
  const civicResults = results.filter((r) => r.quiz_type === "civic");
  const sfiCourses = ["A", "B", "C", "D"];
  const sfiBreakdown = sfiCourses.map((course) => {
    const courseResults = languageResults.filter((r) => r.sfi_course === course);
    return {
      course,
      count: courseResults.length,
      avg: courseResults.length > 0 ? Math.round(courseResults.reduce((s, r) => s + (r.percentage || 0), 0) / courseResults.length) : null,
    };
  }).filter((c) => c.count > 0);

  const avgScore = (items) => {
    if (items.length === 0) return 0;
    return Math.round(items.reduce((sum, r) => sum + (r.percentage || 0), 0) / items.length);
  };

  const totalQuizzes = results.length;
  const overallAvg = avgScore(results);
  const langAvg = avgScore(languageResults);
  const civicAvg = avgScore(civicResults);
  const chartData = results.slice(0, 10).reverse().map((r) => ({
    name: r.source_title?.substring(0, 15) || "Quiz",
    score: r.percentage || 0,
    type: r.quiz_type,
  }));

  const progressStats = [
    { label: "Totalt antal prov", sublabel: "Total Quizzes", value: totalQuizzes, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Totalt genomsnitt", sublabel: "Overall Average", value: `${overallAvg}%`, icon: BarChart3, color: "bg-chart-3/10 text-chart-3" },
    { label: "Språkgenomsnitt", sublabel: "Language Average", value: `${langAvg}%`, icon: BookOpen, color: "bg-chart-1/10 text-chart-1" },
    { label: "Samhällsgenomsnitt", sublabel: "Civic Average", value: `${civicAvg}%`, icon: Landmark, color: "bg-secondary/20 text-secondary-foreground" },
  ];

  const SFI_LEVELS = ["A", "B", "C", "D"];
  const DAILY_GOALS = [5, 10, 15, 30];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Tabs defaultValue="home" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="home">Hem</TabsTrigger>
          <TabsTrigger value="progress">Framsteg</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
        </TabsList>

        {/* Home Tab */}
        <TabsContent value="home" className="space-y-8">

      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {getGreeting()}, {user.full_name?.split(" ")[0] || "Inlärare"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {user.sfi_level ? `SFI ${user.sfi_level} • ` : ""}{user.goal || "Fortsätt lära dig svenska!"}
          </p>
          <p className="text-muted-foreground/60 mt-0.5 text-xs italic">
            {user.sfi_level ? `SFI ${user.sfi_level} • ` : ""}Keep learning Swedish!
          </p>
        </div>

        {/* Streak + XP badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{streak}</span>
            <span className="text-xs text-orange-500">dagars svit</span>
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

      {/* Daily goal */}
      {user.daily_goal_minutes && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-primary" />
                <span>Dagligt mål <span className="font-normal text-muted-foreground/70 italic">· Daily goal</span></span>
              </div>
              <span className="text-xs text-muted-foreground">{user.daily_goal_minutes} min mål</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${dailyGoalPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dailyGoalPct >= 100 ? "🎉 Dagligt mål uppnått! · Daily goal met!" : `~${estimatedMinutesToday} / ${user.daily_goal_minutes} min idag · today`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick paths */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/language" className="group">
          <Card className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Svenska</h3>
              <p className="text-sm text-muted-foreground mt-1">Språklektioner per SFI-nivå</p>
              <p className="text-xs text-muted-foreground/60 italic">Language lessons by SFI level</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Fortsätt →</span>
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
              <p className="text-sm text-muted-foreground mt-1">Samhällskunskap & medborgarprov</p>
              <p className="text-xs text-muted-foreground/60 italic">Civic knowledge & citizenship test</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Fortsätt →</span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/language-test" className="group">
          <Card className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <FlaskConical className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground">Prov</h3>
              <p className="text-sm text-muted-foreground mt-1">Testa dig på alla nivåer</p>
              <p className="text-xs text-muted-foreground/60 italic">Quiz yourself across all levels</p>
              <span className="text-xs text-primary font-medium mt-3 inline-block group-hover:underline">Börja →</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Gym card */}
      <Link to="/gym" className="group">
        <Card className="border-border/50 hover:border-violet-400 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Träningssalen</h3>
                  <p className="text-sm text-muted-foreground">Intensiv meningsträning</p>
                  <p className="text-xs text-muted-foreground/60 italic">High-volume cloze sentence practice</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {dueCount > 0 ? (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">{dueCount} förfallna</span>
                ) : (
                  <span className="text-xs text-primary font-medium group-hover:underline">Börja →</span>
                )}
              </div>
            </div>
            {gymStats.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mastery progress</span>
                  <span className="font-semibold text-emerald-600">{masteredPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${masteredPct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-center">
                    <p className="font-bold text-emerald-600">{gymStats.mastered}</p>
                    <p className="text-emerald-600/70">Mastered</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 text-center">
                    <p className="font-bold text-blue-600">{gymStats.learning}</p>
                    <p className="text-blue-600/70">Learning</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-center">
                    <p className="font-bold text-slate-600">{gymStats.new}</p>
                    <p className="text-slate-600/70">New</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Recent activity */}
      {quizResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-foreground">Senaste aktivitet</h2>
              <p className="text-xs text-muted-foreground/60 italic">Recent activity</p>
            </div>
            <button className="text-xs text-primary hover:underline flex items-center gap-1" disabled>
              (Se Framsteg-fliken)
            </button>
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
                      <p className="text-xs text-muted-foreground">{r.score}/{r.total} rätt · correct</p>
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
          <div className="mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Så tjänar du XP</h3>
            <p className="text-xs text-muted-foreground/60 italic">How to earn XP</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { label: "Lektion klar", sublabel: "Lesson complete", xp: 5 },
              { label: "Övning godkänd", sublabel: "Practice passed", xp: 15 },
              { label: "Quiz rätt", sublabel: "Quiz correct", xp: 20 },
              { label: "Flashkort Bra/Lätt", sublabel: "Flashcard Good/Easy", xp: 10 },
              { label: "7-dagars svit", sublabel: "7-day streak", xp: 50 },
              { label: "Dagmål uppnått", sublabel: "Daily goal met", xp: 25 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border/50">
                <span className="text-muted-foreground text-xs">{item.label}<span className="block text-muted-foreground/50 italic">{item.sublabel}</span></span>
                <span className="font-bold text-primary text-xs">+{item.xp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {/* Gym Mastery Stats */}
          {srsCards.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">Träningssalen Framsteg</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="text-2xl font-bold text-primary">{srsCards.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Totalt kort</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="text-2xl font-bold text-emerald-600">{srsCards.filter(c => c.mastery_percentage === 100).length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Mastered (100%)</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="text-2xl font-bold text-blue-600">{srsCards.filter(c => c.mastery_percentage > 0 && c.mastery_percentage < 100).length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Learning (25-75%)</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="text-2xl font-bold text-slate-600">{srsCards.filter(c => c.mastery_percentage === 0).length}</div>
                    <p className="text-xs text-muted-foreground mt-1">New (0%)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

           {resultsLoading ? (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted rounded animate-pulse" /></CardContent></Card>
              ))}
            </div>
          ) : totalQuizzes === 0 ? (
            <EmptyState icon={Trophy} title="Inga provresultat ännu" description="Gör några prov för att se dina framsteg här!" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {progressStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card className="border-border/50">
                        <CardContent className="p-5">
                          <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {chartData.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Senaste poäng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sfiBreakdown.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Språkprov per SFI-kurs</CardTitle>
                    <Link to="/language-test">
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                        <FlaskConical className="w-3 h-3" /> Ta ett prov
                      </Badge>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sfiBreakdown.map(({ course, count, avg }) => (
                        <div key={course} className="p-4 rounded-xl bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-foreground mb-1">SFI {course}</div>
                          <div className={`text-xl font-bold mb-1 ${avg >= 80 ? "text-emerald-600" : avg >= 60 ? "text-yellow-600" : "text-destructive"}`}>
                            {avg}%
                          </div>
                          <div className="text-xs text-muted-foreground">{count} prov</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Provhistorik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.slice(0, 20).map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.quiz_type === "language" ? "bg-primary/10" : "bg-secondary/20"}`}>
                            {result.quiz_type === "language" ? (
                              <BookOpen className="w-4 h-4 text-primary" />
                            ) : (
                              <Landmark className="w-4 h-4 text-secondary-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{result.source_title || "Quiz"}</p>
                            <p className="text-xs text-muted-foreground">{result.created_date ? format(new Date(result.created_date), "MMM d, yyyy") : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={result.percentage >= 70 ? "default" : "secondary"}>
                            {result.score}/{result.total}
                          </Badge>
                          <span className={`text-sm font-bold ${result.percentage >= 80 ? "text-chart-3" : result.percentage >= 60 ? "text-secondary-foreground" : "text-destructive"}`}>
                            {result.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">{initials}</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">{user.full_name || "Learner"}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    level.name === "Nybörjare" ? "bg-slate-100 text-slate-600" :
                    level.name === "Elev" ? "bg-blue-100 text-blue-700" :
                    level.name === "Student" ? "bg-violet-100 text-violet-700" :
                    level.name === "Avancerad" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {level.name}
                  </span>
                </div>
                {nextLevel && (
                  <span className="text-xs text-muted-foreground">{xpInLevel} / {xpNeeded} XP → {nextLevel.name}</span>
                )}
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5 space-y-5">
              <h3 className="font-semibold">Inställningar</h3>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">SFI-nivå</label>
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
                <label className="text-sm text-muted-foreground mb-2 block">Dagligt mål (minuter)</label>
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

              {saved && <p className="text-sm text-emerald-600 font-medium">✓ Sparat!</p>}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Min Ordlista</h3>
              {vocabulary.length === 0 ? (
                <p className="text-sm text-muted-foreground">Din ordlista är tom</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {vocabulary.map((word) => (
                    <div key={word.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{word.swedish}</p>
                        <p className="text-xs text-muted-foreground truncate">{word.english}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVocab(word.id)}
                        className="text-destructive hover:bg-destructive/10 ml-2 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" /> Logga ut
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}