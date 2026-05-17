import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export default function FillInBlanks({ exercises, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!exercises || exercises.length === 0) {
    return <p className="text-muted-foreground text-sm">No fill-in-the-blank exercises available.</p>;
  }

  const ex = exercises[current];
  const isCorrect = selected === ex.answer;

  const handleSelect = async (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const correct = option === ex.answer;
    if (correct) setScore(s => s + 1);
    await awardXP(base44, correct ? XP_REWARDS.cloze_correct : XP_REWARDS.cloze_wrong);
  };

  const handleNext = () => {
    if (current + 1 >= exercises.length) {
      setFinished(true);
      onComplete?.();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false);
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
            <h3 className="font-display text-2xl font-bold mb-1">{pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good job! 👍" : "Keep going! 💪"}</h3>
            <p className="text-4xl font-bold text-primary my-2">{pct}%</p>
            <p className="text-muted-foreground mb-6">{score} / {exercises.length} correct</p>
            <Button onClick={restart} variant="outline" className="gap-2 h-11 md:h-10"><RotateCcw className="w-4 h-4" /> Try Again</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Replace ___ with blank display in sentence
  const parts = ex.sentence_sv.split("___");

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fill in the blank — {current + 1} / {exercises.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">Score: {score}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full mt-2">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / exercises.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Sentence display */}
            <div className="bg-muted/40 rounded-xl p-4 mb-4">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {parts[0]}
                <span className={`inline-block px-3 py-0.5 rounded-lg border-2 mx-1 font-bold transition-colors ${
                  !answered ? "border-dashed border-primary/40 text-primary/40 min-w-[80px] text-center" :
                  isCorrect ? "border-green-500 bg-green-50 text-green-800" :
                  "border-red-500 bg-red-100 text-red-800 line-through"
                }`}>
                  {answered ? selected : "___"}
                </span>
                {answered && !isCorrect && (
                  <span className="inline-block px-3 py-0.5 rounded-lg border-2 border-green-400 bg-green-50 text-green-700 font-bold mx-1">
                    {ex.answer}
                  </span>
                )}
                {parts[1]}
              </p>
              <p className="text-sm text-muted-foreground mt-2 italic">{ex.sentence_en}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {ex.options.map((opt) => {
                let style = "border-border/50 hover:border-primary/40 hover:bg-muted/50";
                if (answered) {
                  if (opt === ex.answer) style = "border-green-500 bg-green-50 text-green-900";
                  else if (opt === selected) style = "border-red-500 bg-red-100 text-red-900";
                  else style = "border-border/30 opacity-40";
                }
                return (
                  <button
                     key={opt}
                     onClick={() => handleSelect(opt)}
                     disabled={answered}
                     className={`p-4 md:p-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-200 flex items-center justify-between gap-2 min-h-12 md:min-h-10 ${style}`}
                   >
                    <span>{opt}</span>
                    {answered && opt === ex.answer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    {answered && opt === selected && opt !== ex.answer && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {answered && (
           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
             <Button onClick={handleNext} className="gap-2 h-11 md:h-10">
               {current + 1 >= exercises.length ? "See Results" : "Next"}
             </Button>
           </motion.div>
         )}
      </CardContent>
    </Card>
  );
}