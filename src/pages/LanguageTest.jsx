import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, ArrowRight, RotateCcw, Trophy, ChevronLeft, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const SFI_COURSES = [
  { id: "A", name: "Course A", subtitle: "Absolute Beginner", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 text-emerald-800" },
  { id: "B", name: "Course B", subtitle: "Beginner",          color: "from-blue-400 to-indigo-500",    bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",    badge: "bg-blue-100 text-blue-800" },
  { id: "C", name: "Course C", subtitle: "Intermediate",      color: "from-violet-400 to-purple-500",  bg: "bg-violet-50 dark:bg-violet-900/20",border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 text-violet-800" },
  { id: "D", name: "Course D", subtitle: "Advanced",          color: "from-orange-400 to-red-500",     bg: "bg-orange-50 dark:bg-orange-900/20",border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-100 text-orange-800" },
];

export default function LanguageTest() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [testState, setTestState] = useState("select"); // select | running | results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => base44.entities.Lesson.list("order", 200),
  });

  const courseLessons = selectedCourse
    ? lessons.filter((l) => l.sfi_course === selectedCourse && l.quiz_questions?.length > 0)
    : [];

  const allQuestions = selectedLesson
    ? (selectedLesson.quiz_questions || [])
    : courseLessons.flatMap((l) => (l.quiz_questions || []).map((q) => ({ ...q, _lessonTitle: l.title })));

  const current = allQuestions[currentQ];
  const score = answers.filter(Boolean).length;
  const percentage = allQuestions.length > 0 ? Math.round((score / allQuestions.length) * 100) : 0;

  const handleAnswer = (idx) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setAnswers((prev) => [...prev, idx === current.correct_index]);
  };

  const handleNext = () => {
    if (currentQ + 1 < allQuestions.length) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      // Save result
      base44.entities.QuizResult.create({
        quiz_type: "language",
        source_id: selectedLesson?.id || selectedCourse,
        source_title: selectedLesson?.title || `SFI ${selectedCourse} — Full Test`,
        sfi_course: selectedCourse,
        skill: selectedLesson?.skill || selectedLesson?.category || "mixed",
        score,
        total: allQuestions.length,
        percentage,
      });
      queryClient.invalidateQueries({ queryKey: ["quizResults"] });
      setTestState("results");
    }
  };

  const resetTest = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowFeedback(false);
    setTestState("select");
    setSelectedLesson(null);
  };

  // ── RESULTS SCREEN ───────────────────────────────────────────────
  if (testState === "results") {
    const emoji = percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪";
    const msg = percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good job!" : "Keep practising!";
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="font-display text-3xl font-bold mb-2">{msg}</h2>
          <p className="text-muted-foreground mb-8">{score} / {allQuestions.length} correct</p>
          <div className="relative w-36 h-36 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${percentage} ${100 - percentage}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{percentage}%</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={resetTest} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Try Again</Button>
            <Button asChild className="gap-2"><Link to="/progress"><Trophy className="w-4 h-4" /> View Progress</Link></Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ RUNNING ─────────────────────────────────────────────────
  if (testState === "running" && current) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={resetTest} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Exit
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            Question {currentQ + 1} of {allQuestions.length}
          </span>
          <Badge variant="outline">SFI {selectedCourse}</Badge>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentQ) / allQuestions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {current._lessonTitle && (
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">{current._lessonTitle}</p>
            )}
            <h2 className="text-xl font-semibold text-foreground mb-6">{current.question}</h2>

            <div className="space-y-3 mb-8">
              {(current.options || []).map((opt, idx) => {
                let cls = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 ";
                if (!showFeedback) {
                  cls += selected === idx
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50";
                } else {
                  if (idx === current.correct_index) cls += "border-emerald-500 bg-emerald-50 text-emerald-700";
                  else if (idx === selected) cls += "border-destructive bg-destructive/10 text-destructive";
                  else cls += "border-border/30 bg-card text-muted-foreground";
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                    <span className="inline-flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button className="w-full gap-2" onClick={handleNext}>
                  {currentQ + 1 < allQuestions.length ? <>Next Question <ArrowRight className="w-4 h-4" /></> : <>See Results <Trophy className="w-4 h-4" /></>}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── SELECTION SCREEN ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Language Tests</h1>
      </div>
      <p className="text-muted-foreground mb-10">Test yourself by SFI course or individual lesson topic</p>

      {/* Course selector */}
      {!selectedCourse ? (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Choose a Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SFI_COURSES.map((course, i) => {
              const count = lessons.filter((l) => l.sfi_course === course.id && l.quiz_questions?.length > 0).length;
              const qCount = lessons.filter((l) => l.sfi_course === course.id).flatMap((l) => l.quiz_questions || []).length;
              return (
                <motion.div key={course.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <button
                    onClick={() => setSelectedCourse(course.id)}
                    disabled={count === 0}
                    className={`w-full text-left rounded-2xl border-2 ${course.border} ${course.bg} p-6 hover:shadow-lg transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${course.badge} mb-2`}>
                          {course.name}
                        </span>
                        <p className="font-semibold text-foreground">{course.subtitle}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white font-bold text-lg`}>
                        {course.id}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {count > 0 ? `${count} lesson${count !== 1 ? "s" : ""} · ${qCount} question${qCount !== 1 ? "s" : ""}` : "No lessons with quizzes yet"}
                    </p>
                    {count > 0 && (
                      <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-foreground group-hover:gap-2 transition-all">
                        Start Test <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelectedCourse(null)} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
            ← All Courses
          </button>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Full course test */}
            <Card
              className="flex-1 border-2 border-primary/30 bg-primary/5 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => { setSelectedLesson(null); setTestState("running"); }}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Full Course {selectedCourse} Test</p>
                  <p className="text-sm text-muted-foreground">
                    {courseLessons.flatMap((l) => l.quiz_questions || []).length} questions across all topics
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary ml-auto" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Or choose a specific topic</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : courseLessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No quizzes available for this course yet.</p>
              <Link to="/language" className="text-primary text-sm hover:underline mt-1 inline-block">Generate lessons first →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseLessons.map((lesson, i) => (
                <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="border-border/50 hover:border-primary/40 hover:shadow-md cursor-pointer transition-all group"
                    onClick={() => { setSelectedLesson(lesson); setTestState("running"); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{lesson.title}</p>
                          {lesson.title_sv && <p className="text-xs text-muted-foreground italic mt-0.5">{lesson.title_sv}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{lesson.quiz_questions.length} questions</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}