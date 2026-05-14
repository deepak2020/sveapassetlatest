import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, Landmark, Trophy, TrendingUp, Target, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import EmptyState from "../components/shared/EmptyState";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Progress() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["quizResults"],
    queryFn: () => base44.entities.QuizResult.list("-created_date", 100),
  });

  const languageResults = results.filter((r) => r.quiz_type === "language");
  const civicResults = results.filter((r) => r.quiz_type === "civic");

  // SFI course breakdown
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

  // Prepare chart data — last 10 quizzes
  const chartData = results.slice(0, 10).reverse().map((r) => ({
    name: r.source_title?.substring(0, 15) || "Quiz",
    score: r.percentage || 0,
    type: r.quiz_type,
  }));

  const stats = [
    { label: "Total Quizzes", value: totalQuizzes, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Overall Average", value: `${overallAvg}%`, icon: TrendingUp, color: "bg-chart-3/10 text-chart-3" },
    { label: "Language Average", value: `${langAvg}%`, icon: BookOpen, color: "bg-chart-1/10 text-chart-1" },
    { label: "Civic Average", value: `${civicAvg}%`, icon: Landmark, color: "bg-secondary/20 text-secondary-foreground" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-chart-3" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Your Progress</h1>
        </div>
        <p className="text-muted-foreground mt-1">Track your learning journey</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : totalQuizzes === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No quiz results yet"
          description="Complete some quizzes in the Language or Civic sections to see your progress here!"
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
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

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="border-border/50 mb-10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SFI Course Breakdown */}
          {sfiBreakdown.length > 0 && (
            <Card className="border-border/50 mb-10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Language Tests by SFI Course</CardTitle>
                <Link to="/language-test">
                  <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                    <FlaskConical className="w-3 h-3" /> Take a test
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
                      <div className="text-xs text-muted-foreground">{count} test{count !== 1 ? "s" : ""}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Results */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.slice(0, 20).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        result.quiz_type === "language" ? "bg-primary/10" : "bg-secondary/20"
                      }`}>
                        {result.quiz_type === "language" ? (
                          <BookOpen className="w-4 h-4 text-primary" />
                        ) : (
                          <Landmark className="w-4 h-4 text-secondary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{result.source_title || "Quiz"}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.created_date ? format(new Date(result.created_date), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={result.percentage >= 70 ? "default" : "secondary"}>
                        {result.score}/{result.total}
                      </Badge>
                      <span className={`text-sm font-bold ${
                        result.percentage >= 80 ? "text-chart-3" : result.percentage >= 60 ? "text-secondary-foreground" : "text-destructive"
                      }`}>
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
    </div>
  );
}