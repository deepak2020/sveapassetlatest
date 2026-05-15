import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { User, Zap, Flame, BookOpen, Trophy, LogOut, BarChart3, Trash2, TrendingUp, Target, Landmark, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getLevelProgress, getNextLevel } from "@/lib/xp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EmptyState from "../components/shared/EmptyState";

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

  const { data: vocabulary = [] } = useQuery({
    queryKey: ["my-vocabulary"],
    queryFn: () => base44.entities.UserVocabulary.list(),
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["quizResults"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 100),
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

  const handleDeleteVocab = async (vocabId) => {
    await base44.entities.UserVocabulary.delete(vocabId);
    // Refetch vocabulary list
    window.location.reload();
  };

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
    { label: "Totalt genomsnitt", sublabel: "Overall Average", value: `${overallAvg}%`, icon: TrendingUp, color: "bg-chart-3/10 text-chart-3" },
    { label: "Språkgenomsnitt", sublabel: "Language Average", value: `${langAvg}%`, icon: BookOpen, color: "bg-chart-1/10 text-chart-1" },
    { label: "Samhällsgenomsnitt", sublabel: "Civic Average", value: `${civicAvg}%`, icon: Landmark, color: "bg-secondary/20 text-secondary-foreground" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
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
          { label: "Totalt XP", icon: Zap, color: "text-primary", value: xp.toLocaleString() },
          { label: "Dagars svit", icon: Flame, color: "text-orange-500", value: streak },
          { label: "Prov gjorda", icon: BookOpen, color: "text-blue-500", value: quizResults.length },
          { label: "Bemästrade ord", icon: Trophy, color: "text-emerald-500", value: mastered },
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
            <span className="text-sm text-muted-foreground">Provnoggrannhet · <span className="italic">Quiz accuracy</span></span>
            <span className="font-bold text-primary">{accuracy}%</span>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="progress">Framsteg</TabsTrigger>
          <TabsTrigger value="vocabulary">Min Ordlista</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-5">
              <h2 className="font-semibold">Inställningar <span className="text-sm font-normal italic text-muted-foreground">· Settings</span></h2>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">SFI-nivå · <span className="italic">SFI Level</span></label>
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
                <label className="text-sm text-muted-foreground mb-2 block">Dagligt mål (minuter) · <span className="italic">Daily goal (minutes)</span></label>
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

              {saved && <p className="text-sm text-emerald-600 font-medium">✓ Sparat! · Saved!</p>}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" /> Logga ut · <span className="italic">Log out</span>
          </Button>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {resultsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted rounded animate-pulse" /></CardContent></Card>
              ))}
            </div>
          ) : totalQuizzes === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Inga provresultat ännu · No quiz results yet"
              description="Gör några prov för att se dina framsteg här!"
            />
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
                    <CardTitle className="text-lg font-semibold">Senaste poäng <span className="text-sm font-normal italic text-muted-foreground">· Recent Scores</span></CardTitle>
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

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-4">
          {vocabulary.length === 0 ? (
            <EmptyState icon={BookOpen} title="Min Ordlista är tom" description="Lägg till ord från dina lektioner för att bygga upp din ordlista!" />
          ) : (
            <div className="grid gap-3">
              {vocabulary.map((word) => (
                <div key={word.id} className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{word.swedish}</p>
                    <p className="text-sm text-muted-foreground">{word.english}</p>
                    {word.lesson_title && (
                      <p className="text-xs text-muted-foreground/70 mt-1">Från: {word.lesson_title}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVocab(word.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}