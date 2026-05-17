import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Clock, ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_QUESTIONS = 25;
const TEST_MINUTES = 30;
const PASS_PCT = 75;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CitizenshipTest() {
  const [stage, setStage] = useState("intro"); // intro | running | done
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // {index: selectedOptionIndex}
  const [currentQ, setCurrentQ] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TEST_MINUTES * 60);

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["citizenship-pool"],
    queryFn: () => base44.entities.CivicTopic.list("-created_date", 500),
  });

  const allQuestions = useMemo(() => {
    const pool = [];
    for (const t of topics) {
      for (const q of t.quiz_questions || []) {
        if (q?.options?.length && typeof q.correct_index === "number") {
          pool.push({ ...q, topicTitle: t.title });
        }
      }
    }
    return pool;
  }, [topics]);

  // Timer
  useEffect(() => {
    if (stage !== "running") return;
    if (secondsLeft <= 0) { finish(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, secondsLeft]);

  const startTest = () => {
    const picked = shuffle(allQuestions).slice(0, Math.min(TOTAL_QUESTIONS, allQuestions.length));
    setQuestions(picked);
    setAnswers({});
    setCurrentQ(0);
    setSecondsLeft(TEST_MINUTES * 60);
    setStage("running");
  };

  const selectAnswer = (idx) => {
    setAnswers((a) => ({ ...a, [currentQ]: idx }));
  };

  const next = () => {
    if (currentQ + 1 >= questions.length) finish();
    else setCurrentQ(currentQ + 1);
  };

  const prev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const finish = async () => {
    setStage("done");
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0),
      0
    );
    const percentage = Math.round((correct / questions.length) * 100);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        await base44.entities.QuizResult.create({
          quiz_type: "civic",
          source_id: "citizenship-test",
          source_title: "Medborgarskapsprov (Mock)",
          score: correct,
          total: questions.length,
          percentage,
        });
      }
    } catch (_) {}
  };

  const restart = () => {
    setStage("intro");
    setQuestions([]);
    setAnswers({});
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `${m}:${r}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  // INTRO
  if (stage === "intro") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/civic" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Tillbaka till samhälle
        </Link>
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-secondary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Medborgarskapsprov</h1>
            <p className="text-muted-foreground mb-1">Mock Swedish Citizenship Test</p>
            <p className="text-sm text-muted-foreground/70 italic mb-8">
              Simulates the official UHR exam — randomized questions from all chapters
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 text-center">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{Math.min(TOTAL_QUESTIONS, allQuestions.length)}</p>
                <p className="text-xs text-muted-foreground mt-1">frågor · questions</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{TEST_MINUTES}</p>
                <p className="text-xs text-muted-foreground mt-1">minuter · minutes</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{PASS_PCT}%</p>
                <p className="text-xs text-muted-foreground mt-1">för godkänt · to pass</p>
              </div>
            </div>

            {allQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Inga frågor tillgängliga ännu. Lägg till civic topics först.
              </p>
            ) : (
              <Button onClick={startTest} size="lg" className="gap-2">
                <Play className="w-5 h-5" /> Starta prov · Start exam
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // DONE
  if (stage === "done") {
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0),
      0
    );
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= PASS_PCT;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-orange-100 dark:bg-orange-950/40"
              }`}>
                {passed ? (
                  <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <RotateCcw className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">
                {passed ? "Godkänt! 🎉" : "Inte godkänt"}
              </h2>
              <p className="text-muted-foreground italic mb-6">{passed ? "Passed!" : "Not passed yet"}</p>
              <p className="text-6xl font-bold text-primary mb-2">{percentage}%</p>
              <p className="text-muted-foreground mb-8">
                {correct} av {questions.length} rätt · {correct} of {questions.length} correct
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={restart} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Försök igen
                </Button>
                <Link to="/civic">
                  <Button variant="ghost" className="gap-2">
                    Studera vidare <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Review answers */}
              <div className="mt-10 text-left space-y-3">
                <h3 className="font-semibold mb-3">Granska svar · Review</h3>
                {questions.map((q, i) => {
                  const sel = answers[i];
                  const isCorrect = sel === q.correct_index;
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${
                      isCorrect ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                    }`}>
                      <p className="text-sm font-medium mb-1">
                        {i + 1}. {q.question_sv || q.question_en}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isCorrect ? "✓ " : "✗ "}
                        Rätt svar: <span className="font-semibold">{q.options[q.correct_index]}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // RUNNING
  const q = questions[currentQ];
  const sel = answers[currentQ];
  const answered = sel !== undefined;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Fråga {currentQ + 1} / {questions.length}
        </span>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-semibold ${
          secondsLeft < 60 ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-muted text-foreground"
        }`}>
          <Clock className="w-3.5 h-3.5" />
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {q.topicTitle}
              </p>
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{q.question_sv || q.question_en}</h3>
              {q.question_sv && q.question_en && (
                <p className="text-sm text-muted-foreground italic mb-5">{q.question_en}</p>
              )}

              <div className="space-y-3 mt-6">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 min-h-12 ${
                      sel === i
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <Button variant="outline" onClick={prev} disabled={currentQ === 0} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Förra
        </Button>
        <span className="text-xs text-muted-foreground">
          {answeredCount} / {questions.length} besvarade
        </span>
        {currentQ + 1 >= questions.length ? (
          <Button onClick={finish} className="gap-2" disabled={!answered}>
            Lämna in <CheckCircle2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={next} className="gap-2" disabled={!answered}>
            Nästa <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}