import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// Simple fuzzy check: allow 1-2 character differences (typos)
function isCloseEnough(input, answer) {
  const a = input.trim().toLowerCase().replace(/[.,!?]/g, "");
  const b = answer.trim().toLowerCase().replace(/[.,!?]/g, "");
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  let diff = 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  for (let i = 0; i < longer.length; i++) {
    if (longer[i] !== shorter[i]) diff++;
    if (diff > 2) return false;
  }
  return true;
}

export default function SentenceTranslation({ wordPairs, onComplete }) {
  const exercises = (wordPairs || []).filter(wp => wp.example_en && wp.example_sv);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!exercises.length) {
    return <p className="text-muted-foreground text-sm">No sentence translation exercises available for this lesson.</p>;
  }

  const ex = exercises[current];
  const isCorrect = submitted && isCloseEnough(input, ex.example_sv);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    if (isCloseEnough(input, ex.example_sv)) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= exercises.length) {
      setFinished(true);
      const finalScore = isCorrect ? score : score; // score is already updated for current question via handleSubmit
      onComplete?.(finalScore, exercises.length);
    } else {
      setCurrent(c => c + 1);
      setInput("");
      setSubmitted(false);
      setShowHint(false);
    }
  };

  const restart = () => {
    setCurrent(0); setInput(""); setSubmitted(false);
    setScore(0); setFinished(false); setShowHint(false);
  };

  if (finished) {
    const pct = Math.round((score / exercises.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-1">
              {pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good job! 👍" : "Keep going! 💪"}
            </h3>
            <p className="text-4xl font-bold text-primary my-2">{pct}%</p>
            <p className="text-muted-foreground mb-6">{score} / {exercises.length} correct</p>
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Translate to Swedish — {current + 1} / {exercises.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">Score: {score}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* English sentence to translate */}
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Translate this sentence to Swedish:</p>
              <p className="text-lg font-semibold text-foreground">{ex.example_en}</p>
              <p className="text-xs text-muted-foreground mt-2">Word: <span className="font-medium">{ex.english} → {ex.swedish}</span></p>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={submitted}
                placeholder="Type the Swedish translation..."
                rows={2}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!submitted) handleSubmit(); } }}
                className="w-full rounded-xl border-2 border-border/50 bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/60 disabled:opacity-60 transition-colors"
              />
            </div>

            {/* Hint */}
            {!submitted && (
              <button
                onClick={() => setShowHint(v => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            )}
            {showHint && !submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Hint: starts with "<span className="font-semibold text-amber-700">{ex.example_sv.split(" ")[0]}</span>"
              </motion.div>
            )}

            {/* Feedback after submit */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 border-2 ${isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-red-500" />}
                  <span className={`font-semibold text-sm ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                    {isCorrect ? "Correct!" : "Not quite"}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-foreground mt-1">
                    Correct answer: <span className="font-semibold">{ex.example_sv}</span>
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-1">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!input.trim()} className="ml-auto">
              Check
            </Button>
          ) : (
            <Button onClick={handleNext} className="ml-auto">
              {current + 1 >= exercises.length ? "See Results" : "Next →"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}